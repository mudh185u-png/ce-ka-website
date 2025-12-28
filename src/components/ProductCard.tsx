import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { ShoppingCart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const getLocalized = (obj: { [key: string]: string } | undefined) => {
        if (!obj) return '';
        return obj[i18n.language] || obj['en'] || '';
    };

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;

    return (
        <div
            className="product-card"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className="product-image-container">
                <img
                    src={product.images?.[0] || 'https://via.placeholder.com/300'}
                    alt={getLocalized(product.title)}
                    loading="lazy"
                    className="product-image"
                />

                {product.badge && (
                    <div className={`product-badge ${product.badge}`}>
                        {product.badge === 'sale' ? t('common.sale') : t('common.new')}
                    </div>
                )}

                <button
                    className="favorite-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        // Future: Add to wishlist logic
                    }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
            </div>

            <div className="product-info">
                <div className="product-category">
                    {t(`categories.${product.category}`, product.category)}
                </div>

                <h3 className="product-title">
                    {getLocalized(product.title)}
                </h3>

                <div className="product-price-container">
                    <div className="price-wrapper">
                        {hasDiscount && (
                            <span className="old-price">
                                {product.price.toLocaleString()} TL
                            </span>
                        )}
                        <span className={`current-price ${hasDiscount ? 'discount' : ''}`}>
                            {(hasDiscount ? product.discountPrice! : product.price).toLocaleString()} TL
                        </span>
                    </div>

                    <button
                        className="add-cart-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            addToCart({ ...product, price: hasDiscount ? product.discountPrice! : product.price });
                        }}
                    >
                        <ShoppingCart size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
