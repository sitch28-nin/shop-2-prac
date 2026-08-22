import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type CartItem = {
    id: string;
    name_product: string;
    stock: number;
    price: number;
    quantity: number;
}

type CartStore = {
    items: CartItem[];
    addItem: (product: { id: string, name_product: string, stock: number, price: number}) => void;
    removeItem: (id: string) => void;
    clearCart: () => void;
    increaseItem: (id: string) => void;
    decreaseItem: (id: string) => void;
}

export const useCartStore = create<CartStore>()(
    persist(
        (set) => ({
            items: [],
            addItem: (product) => 
                set((state) => {
                    if (product.stock <= 0) {
                        return {
                            items: state.items
                        };
                    }
                    const existing = state.items.find((item) => item.id === product.id);
                    if (existing) {
                        if (existing.quantity >= existing.stock) {
                            return {
                                items: state.items
                            };
                        }
                        return {
                            items: state.items.map((item) => item.id === product.id ? {...item, quantity: item.quantity + 1} : item),
                        };
                    }
                    return { items: [...state.items, {...product, quantity: 1}]};
                }),
            removeItem: (id) =>
                set((state) => ({
                    items: state.items.filter((item) => item.id !== id),
                })),
            clearCart: () => set({ items: [] }),
            increaseItem: (id) =>
                set((state) => {
                    const item = state.items.find((item) => item.id === id);
                    if (!item) {
                        return {
                            items: state.items
                        };
                    }

                    if (item.quantity >= item.stock) {
                        return {
                            items: state.items
                        };
                    } else {
                        return {
                            items: state.items.map((item) => item.id === id ? {...item, quantity: item.quantity + 1} : item)
                        };
                    }
                }),
            decreaseItem: (id) =>
                set((state) => {
                    const item = state.items.find((item) => item.id === id);
                    if (!item) {
                        return {
                            items: state.items,
                        };
                    }

                    if (item.quantity === 1) {
                        return {
                            items: state.items.filter((item) => item.id !== id),
                        };
                    }

                    return {
                        items: state.items.map((item) => item.id === id ? {...item, quantity: item.quantity - 1} : item)
                    };
                }),   
        }),
        {name: 'cart-storage'}
    )
);