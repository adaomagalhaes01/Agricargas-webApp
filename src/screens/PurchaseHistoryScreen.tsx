import React, { useState, useEffect, useCallback, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    Image,
    SafeAreaView,
    StatusBar,
    ScrollView,
    Modal,
    Dimensions,
    Animated,
    Easing,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useAuth, API_URL } from "../context/AuthContext";

const { width } = Dimensions.get("window");

type PurchaseStatus = "delivered" | "confirmed" | "shipped" | "pending" | "cancelled";

interface PurchaseItem {
    id: string;
    productName: string;
    quantity: string;
    price: string;
    date: string;
    status: PurchaseStatus;
    image: any;
    items?: any[];
    supplier?: string;
    orderNumber?: string;
    paymentMethod?: string;
    deliveryAddress?: string;
    notes?: string;
}

const statusConfig: Record<PurchaseStatus, { label: string; color: string; bg: string; icon: string; iconBg: string }> = {
    delivered: { label: "Delivered", color: "#1B8A4E", bg: "#D4F4E7", icon: "checkmark-circle", iconBg: "#E8F9EF" },
    confirmed: { label: "Confirmed", color: "#22C55E", bg: "#D4F4E7", icon: "checkmark-circle-outline", iconBg: "#E8F9EF" },
    shipped: { label: "Shipped", color: "#3B82F6", bg: "#DBEAFE", icon: "car-outline", iconBg: "#EFF6FF" },
    pending: { label: "Pending", color: "#D4A017", bg: "#FFF8E1", icon: "time", iconBg: "#FFFCE8" },
    cancelled: { label: "Cancelled", color: "#E53935", bg: "#FFE5E5", icon: "close-circle", iconBg: "#FFF0F0" },
};

type FilterType = "todos" | PurchaseStatus;

// ── Skeleton Component ──────────────────────────────────────
const SkeletonPulse = ({ style }: { style: any }) => {
    const pulseAnim = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0.3,
                    duration: 800,
                    easing: Easing.inOut(Easing.ease),
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                { backgroundColor: "#E8E8E8", borderRadius: 8, overflow: "hidden" },
                style,
                { opacity: pulseAnim },
            ]}
        />
    );
};

const SummaryCardSkeleton = () => (
    <View style={styles.summaryCard}>
        <View style={styles.summaryLeft}>
            <SkeletonPulse style={{ width: 80, height: 13, marginBottom: 8 }} />
            <SkeletonPulse style={{ width: 140, height: 24 }} />
        </View>
        <View style={styles.summaryRight}>
            <SkeletonPulse style={{ width: 44, height: 44, borderRadius: 22, marginBottom: 6 }} />
            <SkeletonPulse style={{ width: 60, height: 12 }} />
        </View>
    </View>
);

const FiltersSkeleton = () => (
    <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersContainer}
        style={{ flexGrow: 0, marginTop: 16, marginBottom: 10 }}
    >
        {[1, 2, 3, 4, 5].map((i) => (
            <SkeletonPulse
                key={i}
                style={{ width: 80 + i * 5, height: 38, borderRadius: 20 }}
            />
        ))}
    </ScrollView>
);

const PurchaseItemSkeleton = () => (
    <View style={[styles.card, { opacity: 1 }]}>
        <SkeletonPulse style={{ width: 65, height: 65, borderRadius: 10 }} />
        <View style={[styles.cardContent, { gap: 6 }]}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <SkeletonPulse style={{ width: "50%", height: 15 }} />
                <SkeletonPulse style={{ width: 70, height: 20, borderRadius: 12 }} />
            </View>
            <SkeletonPulse style={{ width: "30%", height: 13 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <SkeletonPulse style={{ width: "35%", height: 14 }} />
                <SkeletonPulse style={{ width: "25%", height: 12 }} />
            </View>
        </View>
    </View>
);

const PurchaseListSkeleton = () => (
    <View style={styles.listContainer}>
        {[1, 2, 3, 4, 5].map((i) => (
            <PurchaseItemSkeleton key={i} />
        ))}
    </View>
);

export default function PurchaseHistoryScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const { t } = useTranslation();

    const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState<FilterType>("todos");
    const [selectedPurchase, setSelectedPurchase] = useState<PurchaseItem | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const fetchPurchases = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/orders/user/${user.id}`);

            if (!res.ok) {
                throw new Error(`API error: status ${res.status}`);
            }

            const data = await res.json();

            if (!Array.isArray(data)) {
                throw new Error("Invalid data format from API");
            }

            // Map backend orders to our format
            const mapped: PurchaseItem[] = data.map((order: any) => {
                const firstItem = order.items?.[0];
                const productImage = firstItem?.productImage;

                return {
                    id: order.id,
                    productName: firstItem?.productName || t("order"),
                    quantity: order.items?.length > 1 ? `${order.items.length} ${t("items")}` : `1 ${t("item")}`,
                    price: `${(order.total || 0).toLocaleString("en-US")} Kzs`,
                    date: new Date(order.created_at).toLocaleDateString("en-GB"),
                    status: order.status || "pending",
                    image: productImage ? { uri: productImage } : null,
                    items: order.items,
                    orderNumber: order.id,
                    deliveryAddress: order.delivery_address,
                    paymentMethod: t("bankTransfer"),
                };
            });

            setPurchases(mapped);
        } catch (error) {
            console.error("Failed to load purchase history:", error);
            setPurchases([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [user]);

    useEffect(() => {
        fetchPurchases();
    }, [fetchPurchases]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchPurchases();
    }, [fetchPurchases]);

    // Refresh data whenever the screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchPurchases();
        }, [fetchPurchases])
    );

    const filteredPurchases =
        activeFilter === "todos"
            ? purchases
            : purchases.filter((p) => p.status === activeFilter);

    const totalSpent = filteredPurchases.reduce((acc, item) => {
        const value = parseInt(item.price.replace(/[^0-9]/g, ""), 10) || 0;
        return acc + value;
    }, 0);

    const filters: { key: FilterType; label: string }[] = [
        { key: "todos", label: t("all") },
        { key: "pending", label: t("pending") },
        { key: "shipped", label: t("shipped") },
        { key: "delivered", label: t("delivered") },
        { key: "cancelled", label: t("cancelled") },
    ];

    const openDetail = (item: PurchaseItem) => {
        setSelectedPurchase(item);
        setModalVisible(true);
    };

    const closeDetail = () => {
        setModalVisible(false);
        setSelectedPurchase(null);
    };

    const renderDetailModal = () => {
        if (!selectedPurchase) return null;
        const config = statusConfig[selectedPurchase.status];

        return (
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={closeDetail}
            >
                <View style={modalStyles.overlay}>
                    <View style={modalStyles.container}>
                        {/* Modal Header */}
                        <View style={modalStyles.header}>
                            <Text style={modalStyles.headerTitle}>{t("orderDetails")}</Text>
                            <TouchableOpacity
                                style={modalStyles.closeButton}
                                onPress={closeDetail}
                            >
                                <Ionicons name="close" size={22} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={modalStyles.scrollContent}
                        >
                            {/* Product Info */}
                            <View style={modalStyles.productSection}>
                                {selectedPurchase.image ? (
                                    <Image
                                        source={selectedPurchase.image}
                                        style={modalStyles.productImage}
                                    />
                                ) : (
                                    <View style={[modalStyles.productImage, { backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" }]}>
                                        <Ionicons name="cube-outline" size={32} color="#ccc" />
                                    </View>
                                )}
                                <View style={modalStyles.productInfo}>
                                    <Text style={modalStyles.productName}>
                                        {selectedPurchase.productName}
                                    </Text>
                                    <Text style={modalStyles.orderNumber}>
                                        {selectedPurchase.orderNumber}
                                    </Text>
                                    <View
                                        style={[
                                            modalStyles.statusBadgeLarge,
                                            { backgroundColor: config.bg },
                                        ]}
                                    >
                                        <Ionicons
                                            name={config.icon as any}
                                            size={16}
                                            color={config.color}
                                        />
                                        <Text
                                            style={[
                                                modalStyles.statusTextLarge,
                                                { color: config.color },
                                            ]}
                                        >
                                            {config.label}
                                        </Text>
                                    </View>
                                </View>
                            </View>

                            {/* Status Timeline */}
                            <View style={modalStyles.timelineSection}>
                                <Text style={modalStyles.sectionTitle}>{t("orderTimeline")}</Text>
                                {renderTimeline(selectedPurchase.status, selectedPurchase.date)}
                            </View>

                            {/* Details Grid */}
                            <View style={modalStyles.detailsSection}>
                                <Text style={modalStyles.sectionTitle}>{t("details")}</Text>

                                <View style={modalStyles.detailRow}>
                                    <View style={modalStyles.detailItem}>
                                        <View style={[modalStyles.detailIcon, { backgroundColor: "#EEF2FF" }]}>
                                            <Ionicons name="cube-outline" size={18} color="#6366F1" />
                                        </View>
                                        <View>
                                            <Text style={modalStyles.detailLabel}>{t("quantity")}</Text>
                                            <Text style={modalStyles.detailValue}>{selectedPurchase.quantity}</Text>
                                        </View>
                                    </View>
                                    <View style={modalStyles.detailItem}>
                                        <View style={[modalStyles.detailIcon, { backgroundColor: "#D4F4E7" }]}>
                                            <Ionicons name="cash-outline" size={18} color="#22C55E" />
                                        </View>
                                        <View>
                                            <Text style={modalStyles.detailLabel}>{t("price")}</Text>
                                            <Text style={modalStyles.detailValue}>{selectedPurchase.price}</Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={modalStyles.detailRow}>
                                    <View style={modalStyles.detailItem}>
                                        <View style={[modalStyles.detailIcon, { backgroundColor: "#FFF8E1" }]}>
                                            <Ionicons name="calendar-outline" size={18} color="#D4A017" />
                                        </View>
                                        <View>
                                            <Text style={modalStyles.detailLabel}>{t("dateLabel")}</Text>
                                            <Text style={modalStyles.detailValue}>{selectedPurchase.date}</Text>
                                        </View>
                                    </View>
                                    <View style={modalStyles.detailItem}>
                                        <View style={[modalStyles.detailIcon, { backgroundColor: "#F0E6FF" }]}>
                                            <Ionicons name="card-outline" size={18} color="#8B5CF6" />
                                        </View>
                                        <View>
                                            <Text style={modalStyles.detailLabel}>{t("paymentMethodLabel")}</Text>
                                            <Text style={modalStyles.detailValue} numberOfLines={1}>
                                                {selectedPurchase.paymentMethod}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={modalStyles.detailFullRow}>
                                    <View style={[modalStyles.detailIcon, { backgroundColor: "#E0F7FA" }]}>
                                        <Ionicons name="person-outline" size={18} color="#0097A7" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={modalStyles.detailLabel}>{t("supplier")}</Text>
                                        <Text style={modalStyles.detailValue}>
                                            {selectedPurchase.supplier || "—"}
                                        </Text>
                                    </View>
                                </View>

                                <View style={modalStyles.detailFullRow}>
                                    <View style={[modalStyles.detailIcon, { backgroundColor: "#FFE5E5" }]}>
                                        <Ionicons name="location-outline" size={18} color="#E53935" />
                                    </View>
                                    <View style={{ flex: 1 }}>
                                        <Text style={modalStyles.detailLabel}>{t("deliveryAddressLabel")}</Text>
                                        <Text style={modalStyles.detailValue}>
                                            {selectedPurchase.deliveryAddress || "—"}
                                        </Text>
                                    </View>
                                </View>

                                {selectedPurchase.notes && (
                                    <View style={modalStyles.notesContainer}>
                                        <Ionicons name="document-text-outline" size={16} color="#888" />
                                        <Text style={modalStyles.notesText}>
                                            {selectedPurchase.notes}
                                        </Text>
                                    </View>
                                )}
                            </View>
                        </ScrollView>

                        {/* Close Button */}
                        <TouchableOpacity
                            style={modalStyles.footerButton}
                            onPress={closeDetail}
                        >
                            <Text style={modalStyles.footerButtonText}>{t("close")}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        );
    };

    const renderTimeline = (status: PurchaseStatus, date: string) => {
        const steps = [
            {
                key: "ordered",
                label: t("orderPlaced"),
                icon: "receipt-outline" as const,
                completed: true,
            },
            {
                key: "confirmed",
                label: t("orderConfirmed"),
                icon: "checkmark-outline" as const,
                completed: status !== "pending" && status !== "cancelled",
            },
            {
                key: "shipped",
                label: status === "cancelled" ? t("orderCancelledStep") : t("orderShipped"),
                icon: status === "cancelled" ? ("close-outline" as const) : ("car-outline" as const),
                completed: status === "delivered" || status === "shipped" || status === "cancelled",
                isCancelled: status === "cancelled",
            },
            {
                key: "delivered",
                label: t("orderDeliveredStep"),
                icon: "home-outline" as const,
                completed: status === "delivered",
                hidden: status === "cancelled",
            },
        ];

        return (
            <View style={modalStyles.timeline}>
                {steps
                    .filter((s) => !s.hidden)
                    .map((step, index, arr) => (
                        <View key={step.key} style={modalStyles.timelineStep}>
                            <View style={modalStyles.timelineLeft}>
                                <View
                                    style={[
                                        modalStyles.timelineDot,
                                        step.completed
                                            ? step.isCancelled
                                                ? modalStyles.timelineDotCancelled
                                                : modalStyles.timelineDotCompleted
                                            : modalStyles.timelineDotPending,
                                    ]}
                                >
                                    <Ionicons
                                        name={step.icon}
                                        size={14}
                                        color={
                                            step.completed
                                                ? step.isCancelled
                                                    ? "#E53935"
                                                    : "#fff"
                                                : "#ccc"
                                        }
                                    />
                                </View>
                                {index < arr.length - 1 && (
                                    <View
                                        style={[
                                            modalStyles.timelineLine,
                                            step.completed && !step.isCancelled
                                                ? modalStyles.timelineLineCompleted
                                                : modalStyles.timelineLinePending,
                                        ]}
                                    />
                                )}
                            </View>
                            <View style={modalStyles.timelineContent}>
                                <Text
                                    style={[
                                        modalStyles.timelineLabel,
                                        step.completed && { color: "#333" },
                                        step.isCancelled && { color: "#E53935" },
                                    ]}
                                >
                                    {step.label}
                                </Text>
                                {step.completed && (
                                    <Text style={modalStyles.timelineDate}>{date}</Text>
                                )}
                            </View>
                        </View>
                    ))}
            </View>
        );
    };

    const renderPurchaseItem = ({ item }: { item: PurchaseItem }) => {
        const config = statusConfig[item.status];
        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => openDetail(item)}
                activeOpacity={0.7}
            >
                {item.image ? (
                    <Image source={item.image} style={styles.cardImage} />
                ) : (
                    <View style={[styles.cardImage, { backgroundColor: "#F0F0F0", alignItems: "center", justifyContent: "center" }]}>
                        <Ionicons name="cube-outline" size={28} color="#ccc" />
                    </View>
                )}
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.productName}>{item.productName}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: config.bg }]}>
                            <Ionicons name={config.icon as any} size={12} color={config.color} />
                            <Text style={[styles.statusText, { color: config.color }]}>
                                {config.label}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.quantity}>{t("qty")} {item.quantity}</Text>
                    <View style={styles.cardFooter}>
                        <Text style={styles.price}>{item.price}</Text>
                        <View style={styles.dateContainer}>
                            <Ionicons name="calendar-outline" size={12} color="#999" />
                            <Text style={styles.dateText}>{item.date}</Text>
                        </View>
                    </View>
                </View>
                <View style={styles.chevronContainer}>
                    <Ionicons name="chevron-forward" size={18} color="#ccc" />
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Detail Modal */}
            {renderDetailModal()}

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>{t("purchaseHistoryTitle")}</Text>
            </View>

            {loading ? (
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SummaryCardSkeleton />
                    <FiltersSkeleton />
                    <PurchaseListSkeleton />
                </ScrollView>
            ) : (
                <>
                    {/* Summary Card */}
                    <View style={styles.summaryCard}>
                        <View style={styles.summaryLeft}>
                            <Text style={styles.summaryLabel}>{t("totalSpent")}</Text>
                            <Text style={styles.summaryValue}>
                                {totalSpent.toLocaleString("en-US")} Kzs
                            </Text>
                        </View>
                        <View style={styles.summaryRight}>
                            <View style={styles.summaryIconCircle}>
                                <Ionicons name="receipt-outline" size={24} color="#22C55E" />
                            </View>
                            <Text style={styles.summaryCount}>{filteredPurchases.length} {t("purchases")}</Text>
                        </View>
                    </View>

                    {/* Filters */}
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.filtersContainer}
                        style={{ flexGrow: 0, marginTop: 16, marginBottom: 10 }}
                    >
                        {filters.map((filter) => (
                            <TouchableOpacity
                                key={filter.key}
                                style={[
                                    styles.filterChip,
                                    activeFilter === filter.key && styles.filterChipActive,
                                ]}
                                onPress={() => setActiveFilter(filter.key)}
                            >
                                <Text
                                    style={[
                                        styles.filterChipText,
                                        activeFilter === filter.key && styles.filterChipTextActive,
                                    ]}
                                >
                                    {filter.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Purchase List */}
                    {filteredPurchases.length > 0 ? (
                        <FlatList
                            data={filteredPurchases}
                            keyExtractor={(item) => item.id}
                            renderItem={renderPurchaseItem}
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.listContainer}
                            refreshControl={
                                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#22C55E"]} />
                            }
                        />
                    ) : (
                        <View style={[styles.emptyContainer, { flex: 1 }]}>
                            <Ionicons name="bag-outline" size={60} color="#ddd" />
                            <Text style={styles.emptyText}>{t("noPurchases")}</Text>
                            <Text style={styles.emptySubText}>
                                {t("purchasesWillAppear")}
                            </Text>
                        </View>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    header: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 12,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    summaryCard: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#D4F4E7",
        marginHorizontal: 20,
        marginTop: 10,
        padding: 18,
        borderRadius: 12,
    },
    summaryLeft: {},
    summaryLabel: {
        fontSize: 13,
        color: "#2E7D5E",
        marginBottom: 4,
    },
    summaryValue: {
        fontSize: 22,
        fontWeight: "bold",
        color: "#1B5E3F",
    },
    summaryRight: {
        alignItems: "center",
    },
    summaryIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
        shadowColor: "#22C55E",
        shadowOpacity: 0.15,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 3,
    },
    summaryCount: {
        fontSize: 12,
        color: "#2E7D5E",
        fontWeight: "600",
    },
    filtersContainer: {
        flexDirection: "row",
        paddingHorizontal: 20,
        paddingRight: 30,
        gap: 10,
        alignItems: "center",
    },
    filterChip: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 20,
        backgroundColor: "#F5F7FA",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    filterChipActive: {
        backgroundColor: "#22C55E",
        borderColor: "#22C55E",
    },
    filterChipText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#666",
    },
    filterChipTextActive: {
        color: "#fff",
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 6,
        paddingBottom: 30,
    },
    card: {
        flexDirection: "row",
        backgroundColor: "#fff",
        marginBottom: 12,
        padding: 12,
        borderRadius: 12,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        alignItems: "center",
    },
    cardImage: {
        width: 65,
        height: 65,
        borderRadius: 10,
    },
    cardContent: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "space-between",
    },
    cardHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    productName: {
        fontSize: 15,
        fontWeight: "bold",
        color: "#000",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 12,
        gap: 4,
    },
    statusText: {
        fontSize: 11,
        fontWeight: "600",
    },
    quantity: {
        fontSize: 13,
        color: "#666",
        marginTop: 2,
    },
    cardFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 4,
    },
    price: {
        fontSize: 14,
        fontWeight: "700",
        color: "#22C55E",
    },
    dateContainer: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    dateText: {
        fontSize: 11,
        color: "#999",
    },
    chevronContainer: {
        paddingLeft: 8,
        justifyContent: "center",
    },
    emptyContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingBottom: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#999",
        marginTop: 16,
    },
    emptySubText: {
        fontSize: 13,
        color: "#bbb",
        marginTop: 6,
    },
});

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    container: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
        paddingBottom: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#F0F0F0",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
    },
    closeButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#F5F7FA",
        alignItems: "center",
        justifyContent: "center",
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 10,
    },
    productSection: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 20,
    },
    productImage: {
        width: 80,
        height: 80,
        borderRadius: 14,
    },
    productInfo: {
        flex: 1,
        marginLeft: 16,
    },
    productName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#000",
        marginBottom: 4,
    },
    orderNumber: {
        fontSize: 12,
        color: "#999",
        marginBottom: 8,
    },
    statusBadgeLarge: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 14,
        gap: 6,
    },
    statusTextLarge: {
        fontSize: 13,
        fontWeight: "700",
    },
    timelineSection: {
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: "700",
        color: "#333",
        marginBottom: 14,
    },
    timeline: {
        paddingLeft: 4,
    },
    timelineStep: {
        flexDirection: "row",
        minHeight: 50,
    },
    timelineLeft: {
        alignItems: "center",
        width: 32,
    },
    timelineDot: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: "center",
        justifyContent: "center",
    },
    timelineDotCompleted: {
        backgroundColor: "#22C55E",
    },
    timelineDotPending: {
        backgroundColor: "#F0F0F0",
        borderWidth: 2,
        borderColor: "#E5E7EB",
    },
    timelineDotCancelled: {
        backgroundColor: "#FFE5E5",
    },
    timelineLine: {
        width: 2,
        flex: 1,
        marginVertical: 4,
    },
    timelineLineCompleted: {
        backgroundColor: "#22C55E",
    },
    timelineLinePending: {
        backgroundColor: "#E5E7EB",
    },
    timelineContent: {
        flex: 1,
        marginLeft: 12,
        paddingBottom: 16,
    },
    timelineLabel: {
        fontSize: 14,
        fontWeight: "600",
        color: "#999",
    },
    timelineDate: {
        fontSize: 11,
        color: "#bbb",
        marginTop: 2,
    },
    detailsSection: {
        marginBottom: 10,
    },
    detailRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 12,
    },
    detailItem: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAFBFC",
        padding: 12,
        borderRadius: 12,
        gap: 10,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    detailIcon: {
        width: 36,
        height: 36,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
    },
    detailLabel: {
        fontSize: 11,
        color: "#999",
        marginBottom: 2,
    },
    detailValue: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
    },
    detailFullRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#FAFBFC",
        padding: 12,
        borderRadius: 12,
        gap: 10,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    notesContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        backgroundColor: "#FFF8E1",
        padding: 12,
        borderRadius: 12,
        gap: 8,
        marginTop: 4,
    },
    notesText: {
        flex: 1,
        fontSize: 13,
        color: "#666",
        lineHeight: 18,
    },
    footerButton: {
        backgroundColor: "#22C55E",
        marginHorizontal: 20,
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: "center",
        shadowColor: "#22C55E",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    footerButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
});
