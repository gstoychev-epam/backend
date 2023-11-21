import { Injectable } from '@nestjs/common';

import { Cart } from '../models';
import { getPgClient } from '../../shared';

type CartItemModel = {
  id: string;
  count: string;
  product_id: string;
};

const findByIdQuery = ({ userId }: { userId: string }) => ({
  text: `SELECT id, cart_items.product_id, cart_items.count FROM carts FULL JOIN cart_items ON cart_items.cart_id = carts.id where user_id = $1 and status = 'OPEN'`,
  values: [userId],
});

const createByQuery = ({ userId }: { userId: string }) => ({
  text: `INSERT INTO carts (user_id, created_at, updated_at, status) VALUES ($1, now(), now(), 'OPEN')`,
  values: [userId],
});

const finishOrderQuery = ({ userId }: { userId: string }) => ({
  text: `UPDATE carts
    SET status = 'ORDERED'
    WHERE user_id = $1
  `,
  values: [userId],
});

const deleteFromCartItems = ({ userId }) => ({
  text: `DELETE FROM cart_items WHERE cart_id IN (SELECT id FROM carts WHERE user_id = $1 and status = 'OPEN')`,
  values: [userId],
});

const insertManyProductsQuery = (
  items: { count: number; cart_id: string }[],
) => {
  const query = {
    text: `INSERT INTO cart_items (count, cart_id) VALUES ${items
      .map(({ count, cart_id }) => `(${count}, '${cart_id}')`)
      .join(',')}`,
    values: [],
  };

  return query;
};

const first = <T>(array: Array<T>) => array[0];
const mapCartRows = (rows: CartItemModel[]): Cart => {
  const cartId = first<CartItemModel>(rows).id;
  return {
    id: cartId,
    items: rows
      .filter(({ product_id }) => Boolean(product_id))
      .map(({ count, product_id }) => ({
        count: Number(count),
        product: {
          id: product_id,
          title: '',
          description: '',
          price: 0,
        },
      })),
  };
};

@Injectable()
export class CartService {
  private userCarts: Record<string, Cart> = {};

  async findByUserId(userId: string): Promise<Cart> {
    const client = getPgClient();
    try {
      await client.connect();
      const cartInfo = await client.query(findByIdQuery({ userId }));
      if (!cartInfo.rows.length) return undefined;
      return mapCartRows(cartInfo.rows);
    } catch {
      return undefined;
    } finally {
      await client.end();
    }
  }

  async createByUserId(userId: string): Promise<Cart> {
    const client = getPgClient();
    try {
      await client.connect();
      await client.query(createByQuery({ userId }));
      return await this.findByUserId(userId);
    } catch {
      return undefined;
    } finally {
      await client.end();
    }
  }

  async findOrCreateByUserId(userId: string): Promise<Cart> {
    const userCart = await this.findByUserId(userId);

    if (userCart) {
      return userCart;
    }

    return this.createByUserId(userId);
  }

  async updateByUserId(userId: string, { items }: Cart): Promise<Cart> {
    const { id } = await this.findOrCreateByUserId(userId);

    const client = getPgClient();
    try {
      await client.connect();
      await client.query(deleteFromCartItems({ userId }));
      const newItems = items.map(item => ({
        cart_id: id,
        count: item.count,
      }));
      await client.query(insertManyProductsQuery(newItems));
      return this.findByUserId(userId);
    } catch (e) {
      return undefined;
    } finally {
      await client.end();
    }
  }

  async removeByUserId(userId) {
    const client = getPgClient();
    try {
      await client.connect();
      await client.query(finishOrderQuery({ userId }));
    } catch {
    } finally {
      await client.end();
    }
  }
}
