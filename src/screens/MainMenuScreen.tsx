import React, { useState } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

const categories = [
  { id: "1", name: "Hortaliças", icon: "leaf-outline", color: "#22C55E", bg: "#D4F4E7" },
  { id: "2", name: "Frutas", icon: "nutrition-outline", color: "#F59E0B", bg: "#FFF8E1" },
  { id: "3", name: "Cereais", icon: "grid-outline", color: "#8B5CF6", bg: "#EDE9FE" },
  { id: "4", name: "Legumes", icon: "flask-outline", color: "#3B82F6", bg: "#DBEAFE" },
  { id: "5", name: "Todos", icon: "apps-outline", color: "#EF4444", bg: "#FFE5E5" },
];

const allProducts = [
  {
    id: "1",
    name: "Tomates",
    price: "10.000 Kzs",
    image: require("../../assets/tomate.png"),
    rating: 4.5,
    reviews: 12,
    category: "Hortaliças",
    badge: null,
  },
  {
    id: "2",
    name: "Cenouras",
    price: "30.000 Kzs",
    image: require("../../assets/cenoura.png"),
    rating: 4.8,
    reviews: 8,
    category: "Hortaliças",
    badge: "Mais Vendido",
  },
  {
    id: "3",
    name: "Tomates Cherry",
    price: "15.000 Kzs",
    image: require("../../assets/tomate.png"),
    rating: 4.2,
    reviews: 5,
    category: "Hortaliças",
    badge: "10% OFF",
  },
  {
    id: "4",
    name: "Cenouras Baby",
    price: "25.000 Kzs",
    image: require("../../assets/cenoura.png"),
    rating: 5.0,
    reviews: 15,
    category: "Legumes",
    badge: "Mais Vendido",
  },
  {
    id: "5",
    name: "Tomates Secos",
    price: "20.000 Kzs",
    image: require("../../assets/tomate.png"),
    rating: 4.0,
    reviews: 3,
    category: "Frutas",
    badge: null,
  },
  {
    id: "6",
    name: "Cenouras Orgânicas",
    price: "35.000 Kzs",
    image: require("../../assets/cenoura.png"),
    rating: 4.9,
    reviews: 20,
    category: "Cereais",
    badge: "Novo",
  },
];

const popularProducts = allProducts.filter(
  (p) => p.badge === "Mais Vendido" || (p.rating ?? 0) >= 4.5
);



export default function MainMenuScreen() {
  const [activeCategory, setActiveCategory] = useState("Todos");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const navigation = useNavigation();
  const { user, signOut } = useAuth();
  const { t, i18n } = useTranslation();

  const currentLang = i18n.language;

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
      ? allProducts
      : allProducts.filter((p) => p.category === activeCategory);

  const handleFilterSelect = (categoryName: string) => {
    setActiveCategory(categoryName);
    setFilterModalVisible(false);
  };

  const renderStars = (rating: number) => (
    <View style={styles.starsRow}>
      <Ionicons name="star" size={12} color="#FFD700" />
      <Text style={styles.ratingNumber}>{rating}</Text>
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
        <Image source={item.image} style={styles.productImage} />
        {item.badge && (
          <View
            style={[
              styles.badgeTag,
              item.badge === "10% OFF" ? styles.badgeDiscount : null,
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
          <Text style={styles.reviewCount}>({item.reviews})</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>{item.price}</Text>
          <TouchableOpacity style={styles.addBtn}>
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

      {/* Header - Logo + Name + Flag */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Image
            source={require("../../assets/agrilogo.png")}
            style={styles.headerLogo}
          />
          <Text style={styles.headerAppName}>AgriRoute</Text>
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

      <ScrollView showsVerticalScrollIndicator={false} bounces={false}>
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
      </ScrollView>
    </SafeAreaView>
  );
}

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
    // Position from top to show the face
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
});