import { productService, Product } from './productService';

export interface AiAction {
    type: 'SEARCH' | 'ADD_TO_CART' | 'CHECKOUT' | 'TALK';
    data?: any;
    message: string;
}

class AiChatService {
    async processMessage(text: string): Promise<AiAction> {
        const input = text.toLowerCase().trim();

        // 1. CHECKOUT intent
        const checkoutKeywords = ['thanh toán', 'checkout', 'mua luôn', 'trả tiền', 'tính tiền', 'hoàn tất đơn'];
        if (checkoutKeywords.some(key => input.includes(key))) {
            return {
                type: 'CHECKOUT',
                message: 'Chào bạn! Tôi đang chuyển hướng bạn đến trang thanh toán để hoàn tất đơn hàng.'
            };
        }

        // 2. Identification of intents (ADD_TO_CART or SEARCH)
        const addToCartKeywords = ['thêm vào giỏ', 'cho vào giỏ', 'bỏ vào giỏ', 'thêm giỏ hàng', 'lấy cho tôi', 'đặt mua'];
        const buyKeywords = ['mua', 'đặt', 'lấy'];
        const searchKeywords = ['tìm kiếm', 'tìm cho mình', 'kiếm', 'xem', 'search', 'có cái', 'tìm'];

        let isAddToCart = addToCartKeywords.some(key => input.includes(key));
        let isBuy = !isAddToCart && buyKeywords.some(key => {
            const regex = new RegExp(`\\b${key}\\b`, 'g');
            return regex.test(input);
        });
        let isSearch = searchKeywords.some(key => input.includes(key));

        // Clean up the input string to find the product name
        let productQuery = input;
        const allStopWords = [...addToCartKeywords, ...buyKeywords, ...searchKeywords, 'cái', 'chiếc', 'mẫu', 'mình', 'tôi', 'hộ', 'giúp', 'cho', 'với', 'nhé', 'à', 'ơi'];

        allStopWords.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            productQuery = productQuery.replace(regex, '');
        });

        productQuery = productQuery.replace(/\s+/g, ' ').trim();

        // If we have a potential product query, try searching for it
        if (productQuery.length > 1) {
            const searchResult = await productService.searchProducts(productQuery);
            const foundProducts = searchResult.data || [];

            if (foundProducts.length > 0) {
                const bestMatch = foundProducts[0];

                if (isAddToCart || isBuy) {
                    return {
                        type: 'ADD_TO_CART',
                        data: bestMatch,
                        message: `Vâng! Tôi đã tìm thấy ${bestMatch.name}. Đang thêm sản phẩm này vào giỏ hàng cho bạn.`
                    };
                }

                if (isSearch || foundProducts.length > 0) {
                    return {
                        type: 'SEARCH',
                        data: foundProducts,
                        message: `Tôi đã tìm thấy ${foundProducts.length} sản phẩm phù hợp. Bạn có muốn xem thêm chi tiết về ${bestMatch.name} không?`
                    };
                }
            } else if (isSearch || isAddToCart || isBuy) {
                return {
                    type: 'TALK',
                    message: `Rất tiếc, tôi không tìm thấy sản phẩm nào liên quan đến "${productQuery}". Bạn có thể thử mô tả chi tiết hơn không?`
                };
            }
        }

        // 3. Fallback: General Chat
        if (input.includes('hi') || input.includes('chào') || input.includes('hello')) {
            return {
                type: 'TALK',
                message: 'Chào bạn! Tôi là trợ lý iCenter. Tôi có thể giúp bạn tìm sản phẩm Apple, thêm vào giỏ hàng hoặc thanh toán nhanh chóng. Bạn cần tìm gì ạ?'
            };
        }

        return {
            type: 'TALK',
            message: 'Tôi chưa hiểu rõ ý bạn lắm. Bạn có thể nói "Thêm iPhone 15 vào giỏ" hoặc "Tìm MacBook Air" được không?'
        };
    }
}

export const aiChatService = new AiChatService();
