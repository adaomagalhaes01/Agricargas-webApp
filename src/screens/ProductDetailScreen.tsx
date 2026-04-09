import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Image,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Alert,
    Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";

const { width } = Dimensions.get("window");

export default function ProductDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const product = (route.params as any)?.product;
    const { t } = useTranslation();
    const { addToCart } = useCart();

    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);
    const [activeTab, setActiveTab] = useState<"delivery" | "pickup">("delivery");

    if (!product) {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Produto não encontrado</Text>
            </SafeAreaView>
        );
    }

    const priceNumber = typeof product.price === 'number'
        ? product.price
        : parseInt(product.price?.replace(/[^0-9]/g, "") || "0", 10);
    const totalPrice = priceNumber * quantity;

    const incrementQuantity = () => setQuantity((q: number) => q + 1);
    const decrementQuantity = () => setQuantity((q: number) => (q > 1 ? q - 1 : 1));

    const handleAddToCart = () => {
        addToCart(product, quantity);
        Alert.alert(
            t("success") || "Sucesso",
            `${quantity}x ${product.name} ${t("addedToCartMsg") || "adicionados ao carrinho"}`,
            [{ text: t("ok"), onPress: () => navigation.goBack() }]
        );
    };

    const formatCurrencyLocal = (value: number) => {
        return `${(value || 0).toLocaleString('pt-AO')} Kz`;
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#000" />

            <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
                {/* Product Image - Full width hero */}
                <View style={styles.imageWrapper}>
                    {typeof product.image === 'string' ? (
                        <Image source={{ uri: product.image }} style={styles.productImage} />
                    ) : (
                        <Image source={product.image} style={styles.productImage} />
                    )}

                    {/* Overlay Header Buttons */}
                    <View style={styles.headerOverlay}>
                        <TouchableOpacity
                            style={styles.headerBtn}
                            onPress={() => navigation.goBack()}
                        >
                            <Ionicons name="chevron-back" size={22} color="#333" />
                        </TouchableOpacity>
                        <View style={styles.headerBtnGroup}>
                            <TouchableOpacity
                                style={styles.headerBtn}
                                onPress={() => setIsFavorite(!isFavorite)}
                            >
                                <Ionicons
                                    name={isFavorite ? "heart" : "heart-outline"}
                                    size={20}
                                    color={isFavorite ? "#EF4444" : "#333"}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.headerBtn}>
                                <Ionicons name="share-social-outline" size={20} color="#333" />
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>

                {/* Product Info Card - overlaps image slightly */}
                <View style={styles.infoCard}>
                    {/* Name & Badge */}
                    <View style={styles.nameRow}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.productName}>{product.name}</Text>
                            <Text style={styles.productSubtitle}>
                                {product.description || "Produto fresco e de alta qualidade"}
                            </Text>
                        </View>
                        {product.badge && (
                            <View style={styles.infoBadge}>
                                <Text style={styles.infoBadgeText}>{product.badge}</Text>
                            </View>
                        )}
                    </View>

                    {/* Location & Rating Row */}
                    <View style={styles.locationRow}>
                        <View style={styles.locationItem}>
                            <Ionicons name="location-outline" size={14} color="#999" />
                            <Text style={styles.locationText}>Angola</Text>
                        </View>
                        <View style={styles.locationItem}>
                            <Ionicons name="star" size={14} color="#FFD700" />
                            <Text style={styles.locationText}>
                                {product.rating || 4.5} ({product.reviews || 0})
                            </Text>
                        </View>
                    </View>

                    {/* Stats Row - Price/Weight/Category */}
                    <View style={styles.statsRow}>
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{formatCurrencyLocal(priceNumber)}</Text>
                            <Text style={styles.statLabel}>{t("price")}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>1 kg</Text>
                            <Text style={styles.statLabel}>{t("weight")}</Text>
                        </View>
                        <View style={styles.statDivider} />
                        <View style={styles.statCard}>
                            <Text style={styles.statValue}>{product.category || "Hortaliças"}</Text>
                            <Text style={styles.statLabel}>{t("categoryLabel")}</Text>
                        </View>
                    </View>

                    {/* Delivery / Pickup Tabs */}
                    <View style={styles.tabRow}>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === "delivery" && styles.tabBtnActive]}
                            onPress={() => setActiveTab("delivery")}
                        >
                            <Ionicons
                                name="bicycle-outline"
                                size={16}
                                color={activeTab === "delivery" ? "#fff" : "#666"}
                            />
                            <Text
                                style={[styles.tabBtnText, activeTab === "delivery" && styles.tabBtnTextActive]}
                            >
                                Entrega
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabBtn, activeTab === "pickup" && styles.tabBtnActive]}
                            onPress={() => setActiveTab("pickup")}
                        >
                            <Ionicons
                                name="storefront-outline"
                                size={16}
                                color={activeTab === "pickup" ? "#fff" : "#666"}
                            />
                            <Text
                                style={[styles.tabBtnText, activeTab === "pickup" && styles.tabBtnTextActive]}
                            >
                                Retirada
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Description */}
                    <Text style={styles.sectionTitle}>{t("description")}</Text>
                    <Text style={styles.descriptionText}>
                        {product.fullDescription ||
                            `Produto agrícola de alta qualidade, cultivado em Angola. ${product.name} frescos, selecionados e prontos para consumo. Ideal para uso doméstico e comercial. Garantimos a frescura e qualidade do produto desde a colheita até a entrega.`}
                    </Text>

                    {/* Supplier Card */}
                    <Text style={styles.sectionTitle}>{t("supplier")}</Text>
                    <View style={styles.supplierCard}>
                        <View style={styles.supplierAvatar}>
                            <Ionicons name="storefront-outline" size={22} color="#22C55E" />
                        </View>
                        <View style={styles.supplierInfo}>
                            <Text style={styles.supplierName}>
                                {product.supplier || "Fazenda Verde Ltda"}
                            </Text>
                            <Text style={styles.supplierLocation}>
                                {product.supplierLocation || "Luanda, Angola"}
                            </Text>
                        </View>
                        <View style={styles.supplierRating}>
                            <Ionicons name="star" size={12} color="#FFD700" />
                            <Text style={styles.supplierRatingText}>4.8</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Bottom Action Bar */}
            <View style={styles.bottomBar}>
                {/* Quantity & Total */}
                <View style={styles.bottomLeft}>
                    <View style={styles.quantityControls}>
                        <TouchableOpacity style={styles.qtyBtn} onPress={decrementQuantity}>
                            <Ionicons name="remove" size={18} color="#333" />
                        </TouchableOpacity>
                        <Text style={styles.qtyValue}>{quantity}</Text>
                        <TouchableOpacity
                            style={[styles.qtyBtn, styles.qtyBtnAdd]}
                            onPress={incrementQuantity}
                        >
                            <Ionicons name="add" size={18} color="#fff" />
                        </TouchableOpacity>
                    </View>
                    <View>
                        <Text style={styles.totalLabel}>{formatCurrencyLocal(totalPrice)}</Text>
                        <Text style={styles.totalSub}>Total {quantity} item(s)</Text>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.addToCartBtn}
                    onPress={handleAddToCart}
                    activeOpacity={0.85}
                >
                    <Text style={styles.addToCartText}>{t("addToCart")}</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FAFBFC",
    },

    // Hero Image
    imageWrapper: {
        width: "100%",
        height: 280,
        backgroundColor: "#E8E8E8",
        position: "relative",
    },
    productImage: {
        width: "100%",
        height: "100%",
        resizeMode: "cover",
    },
    headerOverlay: {
        position: "absolute",
        top: 12,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "space-between",
        paddingHorizontal: 16,
    },
    headerBtn: {
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: "rgba(255,255,255,0.9)",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    headerBtnGroup: {
        flexDirection: "row",
        gap: 8,
    },

    // Info Card
    infoCard: {
        backgroundColor: "#fff",
        marginTop: -20,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 100,
    },
    nameRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    productName: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    productSubtitle: {
        fontSize: 13,
        color: "#999",
        marginTop: 2,
    },
    infoBadge: {
        backgroundColor: "#D4F4E7",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        marginLeft: 8,
    },
    infoBadgeText: {
        fontSize: 11,
        fontWeight: "700",
        color: "#22C55E",
    },

    // Location & Rating
    locationRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 16,
        marginBottom: 18,
    },
    locationItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    locationText: {
        fontSize: 13,
        color: "#999",
    },

    // Stats Row
    statsRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 12,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    statCard: {
        flex: 1,
        alignItems: "center",
    },
    statValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1A1A1A",
        marginBottom: 2,
    },
    statLabel: {
        fontSize: 11,
        color: "#999",
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: "#E5E7EB",
    },

    // Tabs
    tabRow: {
        flexDirection: "row",
        backgroundColor: "#F5F7FA",
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
    },
    tabBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 10,
        borderRadius: 10,
        gap: 6,
    },
    tabBtnActive: {
        backgroundColor: "#22C55E",
        shadowColor: "#22C55E",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    tabBtnText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    tabBtnTextActive: {
        color: "#fff",
    },

    // Sections
    sectionTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#1A1A1A",
        marginBottom: 8,
    },
    descriptionText: {
        fontSize: 14,
        color: "#777",
        lineHeight: 22,
        marginBottom: 20,
    },

    // Supplier
    supplierCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        borderRadius: 14,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    supplierAvatar: {
        width: 44,
        height: 44,
        borderRadius: 14,
        backgroundColor: "#D4F4E7",
        alignItems: "center",
        justifyContent: "center",
    },
    supplierInfo: {
        flex: 1,
        marginLeft: 12,
    },
    supplierName: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1A1A1A",
    },
    supplierLocation: {
        fontSize: 12,
        color: "#999",
        marginTop: 2,
    },
    supplierRating: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#FFF8E1",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    supplierRatingText: {
        fontSize: 12,
        fontWeight: "600",
        color: "#D4A017",
    },

    // Bottom Bar
    bottomBar: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 18,
        paddingVertical: 12,
        paddingBottom: 30,
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#F0F0F0",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: { width: 0, height: -4 },
        elevation: 8,
    },
    bottomLeft: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    quantityControls: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        borderRadius: 10,
        overflow: "hidden",
    },
    qtyBtn: {
        width: 30,
        height: 30,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#EEEEEE",
    },
    qtyBtnAdd: {
        backgroundColor: "#22C55E",
    },
    qtyValue: {
        fontSize: 14,
        fontWeight: "bold",
        color: "#1A1A1A",
        paddingHorizontal: 8,
    },
    totalLabel: {
        fontSize: 13,
        fontWeight: "bold",
        color: "#1A1A1A",
    },
    totalSub: {
        fontSize: 10,
        color: "#999",
    },
    addToCartBtn: {
        backgroundColor: "#22C55E",
        borderRadius: 10,
        paddingHorizontal: 16,
        paddingVertical: 12,
        shadowColor: "#22C55E",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    addToCartText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
});
