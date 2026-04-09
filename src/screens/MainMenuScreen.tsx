import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
  Modal,
  Animated,
  Easing,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

import { API_URL } from "../context/AuthContext";

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

const CategoriesSkeleton = () => (
  <View>
    <View style={skeletonStyles.sectionHeader}>
      <SkeletonPulse style={{ width: 100, height: 18 }} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <View key={i} style={{ alignItems: "center", width: 68 }}>
          <SkeletonPulse style={{ width: 52, height: 52, borderRadius: 16, marginBottom: 6 }} />
          <SkeletonPulse style={{ width: 48, height: 10 }} />
        </View>
      ))}
    </ScrollView>
  </View>
);

const BannerSkeleton = () => (
  <View style={{ marginHorizontal: 18, marginTop: 14 }}>
    <SkeletonPulse style={{ width: "100%", height: 170, borderRadius: 16 }} />
  </View>
);

const HorizontalProductsSkeleton = () => (
  <View>
    <View style={skeletonStyles.sectionHeader}>
      <SkeletonPulse style={{ width: 120, height: 18 }} />
      <SkeletonPulse style={{ width: 50, height: 14 }} />
    </View>
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 18, gap: 12 }}>
      {[1, 2, 3].map((i) => (
        <View key={i} style={skeletonStyles.horizontalCard}>
          <SkeletonPulse style={{ width: "100%", height: 100, borderRadius: 0 }} />
          <View style={{ padding: 10, gap: 6 }}>
            <SkeletonPulse style={{ width: "80%", height: 14 }} />
            <SkeletonPulse style={{ width: "50%", height: 12 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonPulse style={{ width: "45%", height: 14 }} />
              <SkeletonPulse style={{ width: 28, height: 28, borderRadius: 8 }} />
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  </View>
);

const ProductsGridSkeleton = () => (
  <View>
    <View style={skeletonStyles.sectionHeader}>
      <SkeletonPulse style={{ width: 110, height: 18 }} />
      <SkeletonPulse style={{ width: 60, height: 12 }} />
    </View>
    <View style={{ flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 12 }}>
      {[1, 2, 3, 4].map((i) => (
        <View key={i} style={skeletonStyles.gridCard}>
          <SkeletonPulse style={{ width: "100%", height: 120, borderRadius: 0 }} />
          <View style={{ padding: 10, gap: 6 }}>
            <SkeletonPulse style={{ width: "85%", height: 14 }} />
            <SkeletonPulse style={{ width: "50%", height: 12 }} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonPulse style={{ width: "45%", height: 14 }} />
              <SkeletonPulse style={{ width: 28, height: 28, borderRadius: 8 }} />
            </View>
          </View>
        </View>
      ))}
    </View>
  </View>
);

const SearchSkeleton = () => (
  <View style={{ marginHorizontal: 18, marginTop: 10 }}>
    <SkeletonPulse style={{ width: "100%", height: 46, borderRadius: 12 }} />
  </View>
);

export default function MainMenuScreen() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [activeCategory, setActiveCategory] = useState("Todos");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { addToCart, totalItems } = useCart();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    try {
      const [cRes, pRes] = await Promise.all([
        fetch(`${API_URL}/api/categories`),
        fetch(`${API_URL}/api/products`),
      ]);

      if (!cRes.ok || !pRes.ok) {
        throw new Error(`API error: categories=${cRes.status}, products=${pRes.status}`);
      }

      const [cData, pData] = await Promise.all([cRes.json(), pRes.json()]);

      setCategories([
        { id: "all", name: "Todos", icon: "apps-outline", color: "#EF4444", bg: "#FFE5E5" },
        ...(Array.isArray(cData) ? cData : []),
      ]);
      setProducts(Array.isArray(pData) ? pData : []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      // Set defaults even on error so UI isn't stuck
      setCategories([
        { id: "all", name: "Todos", icon: "apps-outline", color: "#EF4444", bg: "#FFE5E5" },
      ]);
      setProducts([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData(true);
  }, [fetchData]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchData(true);
    }, [fetchData])
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const popularProducts = products.filter(
    (p) => p.badge === "Mais Vendido" || (p.rating ?? 0) >= 4.5
  );

  const handleLanguageSwitch = () => {
    const targetLang = currentLang === "pt" ? "en" : "pt";
    const message =
      currentLang === "pt"
        ? "Do you want to change the language to English?"
        : "Deseja mudar o idioma para Português?";
    const title = currentLang === "pt" ? "Change Language" : "Mudar Idioma";

    Alert.alert(title, message, [
      { text: currentLang === "pt" ? "No" : "Não", style: "cancel" },
      {
        text: currentLang === "pt" ? "Yes" : "Sim",
        onPress: () => i18n.changeLanguage(targetLang),
      },
    ]);
  };

  const filteredProducts =
    activeCategory === "Todos"
      ? products
      : products.filter((p) => p.category === activeCategory);

  const handleFilterSelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    setFilterModalVisible(false);
  };

  const formatCurrencyLocal = (value: number) => {
    return `${value.toLocaleString('pt-AO')} Kz`;
  };

  const renderStars = (rating: number) => (
    <View style={styles.starsRow}>
      <Ionicons name="star" size={12} color="#FFD700" />
      <Text style={styles.ratingNumber}>{rating || '0.0'}</Text>
    </View>
  );

  const renderProductCard = (item: any, isHorizontal = false) => (
    <TouchableOpacity
      key={item.id}
      style={isHorizontal ? styles.horizontalCard : styles.verticalCard}
      activeOpacity={0.85}
      onPress={() =>
        (navigation as any).navigate("ProductDetail", { product: item })
      }
    >
      <View
        style={
          isHorizontal
            ? styles.horizontalImageContainer
            : styles.verticalImageContainer
        }
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.productImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
            <Ionicons name="leaf-outline" size={32} color="#ccc" />
          </View>
        )}
        {item.badge && (
          <View
            style={[
              styles.badgeTag,
              item.badge.includes('OFF') ? styles.badgeDiscount : null,
            ]}
          >
            <Text style={styles.badgeText}>{item.badge}</Text>
          </View>
        )}
      </View>
      <View style={styles.cardInfo}>
        <Text style={styles.productName} numberOfLines={1}>
          {item.name}
        </Text>
        <View style={styles.cardMeta}>
          {renderStars(item.rating)}
          <Text style={styles.reviewCount}>({item.reviews || 0})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{formatCurrencyLocal(item.price)}</Text>
          <TouchableOpacity
            style={styles.addBtn}
            onPress={(e) => {
              e.stopPropagation();
              addToCart(item);
              Alert.alert(t("success"), `${item.name} ${t("addedToCart")}`);
            }}
          >
            <Ionicons name="add" size={16} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Filter Modal */}
      <Modal
        visible={filterModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.filterModalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <View style={styles.filterModalContent}>
            <Text style={styles.filterModalTitle}>Filtrar por Categoria</Text>
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.filterModalItem,
                  activeCategory === cat.name && styles.filterModalItemActive,
                ]}
                onPress={() => handleFilterSelect(cat.name)}
              >
                <View
                  style={[
                    styles.filterModalIcon,
                    { backgroundColor: cat.bg },
                  ]}
                >
                  <Ionicons name={cat.icon as any} size={18} color={cat.color} />
                </View>
                <Text
                  style={[
                    styles.filterModalText,
                    activeCategory === cat.name && styles.filterModalTextActive,
                  ]}
                >
                  {cat.name}
                </Text>
                {activeCategory === cat.name && (
                  <Ionicons name="checkmark" size={18} color="#22C55E" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Header - Logo + Name + Greeting + Flag */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/agrilogo.png")}
            style={styles.headerLogo}
          />
          <Text style={styles.headerAppName}>AgriRoute</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.greetingContainer}>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.headerAvatar} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Ionicons name="person" size={14} color="#22C55E" />
              </View>
            )}
            <Text style={styles.greetingText}>
              Olá, {user?.name ? user.name.split(" ")[0] : t("user")}
            </Text>
          </View>
          <TouchableOpacity style={styles.langBtn} onPress={handleLanguageSwitch}>
            <Image
              source={
                currentLang === "pt"
                  ? { uri: "https://flagcdn.com/w40/ao.png" }
                  : { uri: "https://flagcdn.com/w40/us.png" }
              }
              style={styles.flagIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#22C55E"]}
            tintColor="#22C55E"
          />
        }
      >
        {loading ? (
          <View style={{ paddingBottom: 30 }}>
            <SearchSkeleton />
            <BannerSkeleton />
            <CategoriesSkeleton />
            <HorizontalProductsSkeleton />
            <ProductsGridSkeleton />
          </View>
        ) : (
          <>
            {/* Search */}
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#999" />
              <TextInput
                placeholder={t("whatYouNeed")}
                placeholderTextColor="#bbb"
                style={styles.searchInput}
              />
              <TouchableOpacity
                style={styles.filterBtn}
                onPress={() => setFilterModalVisible(true)}
              >
                <Ionicons name="options-outline" size={18} color="#22C55E" />
              </TouchableOpacity>
            </View>

            {/* Banner */}
            <View style={styles.bannerContainer}>
              <Image
                source={require("../../assets/banner.jpg")}
                style={styles.bannerImage}
              />
              <View style={styles.bannerOverlay}>
                <Text style={styles.bannerTitle}>AgriRoute</Text>
                <Text style={styles.bannerSubtitle}>
                  {t("bannerText")}
                </Text>
              </View>
            </View>

            {/* Categories */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("categoriesTitle")}</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryCard,
                    activeCategory === cat.name && styles.categoryCardActive,
                  ]}
                  onPress={() => setActiveCategory(cat.name)}
                >
                  <View
                    style={[
                      styles.categoryIcon,
                      {
                        backgroundColor:
                          activeCategory === cat.name ? cat.color : cat.bg,
                      },
                    ]}
                  >
                    <Ionicons
                      name={cat.icon as any}
                      size={22}
                      color={activeCategory === cat.name ? "#fff" : cat.color}
                    />
                  </View>
                  <Text
                    style={[
                      styles.categoryName,
                      activeCategory === cat.name && styles.categoryNameActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Popular Products */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{t("latestUpdates")}</Text>
              <TouchableOpacity>
                <Text style={styles.seeAllText}>{t("seeAll")}</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.horizontalList}
            >
              {popularProducts.map((item) => renderProductCard(item, true))}
            </ScrollView>

            {/* Products by category */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {activeCategory === "Todos"
                  ? t("allProducts")
                  : activeCategory}
              </Text>
              <Text style={styles.resultCount}>
                {filteredProducts.length} {t("productsCount")}
              </Text>
            </View>
            <View style={styles.productsGrid}>
              {filteredProducts.map((item) => renderProductCard(item, false))}
            </View>

            <View style={{ height: 20 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const skeletonStyles = StyleSheet.create({
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 12,
  },
  horizontalCard: {
    width: 155,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  gridCard: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    margin: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFBFC",
  },

  // Header
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: "#fff",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    resizeMode: "contain",
  },
  headerAppName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22C55E",
  },
  langBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F5F7FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  flagIcon: {
    width: 22,
    height: 15,
    borderRadius: 2,
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F0FFF5",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  headerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#22C55E",
  },
  headerAvatarPlaceholder: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#D4F4E7",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#22C55E",
  },

  // Search
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginHorizontal: 18,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  searchInput: {
    flex: 1,
    paddingLeft: 10,
    color: "#000",
    fontSize: 14,
  },
  filterBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#D4F4E7",
    alignItems: "center",
    justifyContent: "center",
  },

  // Filter Modal
  filterModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  filterModalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 340,
  },
  filterModalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 16,
    textAlign: "center",
  },
  filterModalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 4,
    gap: 12,
  },
  filterModalItemActive: {
    backgroundColor: "#F0FFF5",
  },
  filterModalIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  filterModalText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  filterModalTextActive: {
    color: "#22C55E",
  },

  // Banner
  bannerContainer: {
    marginHorizontal: 18,
    marginTop: 14,
    borderRadius: 16,
    overflow: "hidden",
    height: 170,
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  bannerSubtitle: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 12,
    marginTop: 2,
  },

  // Section Headers
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 18,
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAllText: {
    fontSize: 13,
    color: "#22C55E",
    fontWeight: "600",
  },
  resultCount: {
    fontSize: 12,
    color: "#999",
  },

  // Categories
  categoriesContainer: {
    paddingHorizontal: 18,
    gap: 12,
  },
  categoryCard: {
    alignItems: "center",
    width: 68,
  },
  categoryCardActive: {},
  categoryIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  categoryNameActive: {
    color: "#22C55E",
    fontWeight: "700",
  },

  // Horizontal product cards
  horizontalList: {
    paddingHorizontal: 18,
    gap: 12,
  },
  horizontalCard: {
    width: 155,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  horizontalImageContainer: {
    width: "100%",
    height: 100,
  },

  // Vertical product cards (grid)
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 12,
    gap: 0,
  },
  verticalCard: {
    width: (width - 48) / 2,
    backgroundColor: "#fff",
    borderRadius: 14,
    overflow: "hidden",
    margin: 6,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  verticalImageContainer: {
    width: "100%",
    height: 120,
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badgeTag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#22C55E",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeDiscount: {
    backgroundColor: "#EF4444",
  },
  badgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  cardInfo: {
    padding: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 6,
  },
  starsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
  },
  ratingNumber: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
  },
  reviewCount: {
    fontSize: 11,
    color: "#bbb",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#22C55E",
  },
  addBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
  },
  cartIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F7FA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    position: 'relative'
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#EF4444',
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff'
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: 'bold'
  }
});