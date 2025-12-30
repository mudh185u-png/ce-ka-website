import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { Product } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { ShoppingCart, Heart } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { addToCart } = useCart();

    const { toggleWishlist, isInWishlist } = useWishlist();
    const isFavorite = isInWishlist(product.id);

    const getLocalized = (obj: { [key: string]: string } | undefined) => {
        if (!obj) return '';
        return obj[i18n.language] || obj['en'] || '';
    };

    const getOptimizedUrl = (url: string | undefined, width = 400, height = 400) => {
        if (!url) return 'https://via.placeholder.com/300';
        if (url.includes('supabase.co')) {
            return `${url}?width=${width}&height=${height}&resize=contain&format=webp&quality=80`;
        }
        return url;
    };

    const hasDiscount = product.discountPrice && product.discountPrice < product.price;

    return (
        <div
            className="product-card"
            onClick={() => navigate(`/product/${product.id}`)}
        >
            <div className="product-image-container">
                <img
                    src={getOptimizedUrl(product.images?.[0])}
                    alt={getLocalized(product.title)}
                    width="400"
                    height="400"
                    className="product-image"
                />

                {product.badge && (
                    <div className={`product-badge ${product.badge}`}>
                        {product.badge === 'sale' ? t('common.sale') : t('common.new')}
                    </div>
                )}

                <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWishlist(product);
                    }}
                    style={{
                        backgroundColor: isFavorite ? 'white' : 'rgba(255,255,255,0.8)',
                        color: isFavorite ? '#ff4d4d' : '#333'
                    }}
                >
                    <Heart size={20} fill={isFavorite ? '#ff4d4d' : 'none'} />
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
