import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PaymentModal from "./PaymentModal";
import { useTranslation } from "react-i18next";

interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  image: any;
}

const initialCartItems: CartItem[] = [
  {
    id: "1",
    name: "Tomates",
    unitPrice: 10000,
    quantity: 5,
    unit: "kg",
    image: require("../../assets/tomate.png"),
  },
  {
    id: "2",
    name: "Cenouras",
    unitPrice: 10000,
    quantity: 3,
    unit: "kg",
    image: require("../../assets/tomate.png"),
  },
  {
    id: "3",
    name: "Batatas",
    unitPrice: 5000,
    quantity: 10,
    unit: "kg",
    image: require("../../assets/tomate.png"),
  },
  {
    id: "4",
    name: "Cebolas",
    unitPrice: 8000,
    quantity: 2,
    unit: "kg",
    image: require("../../assets/tomate.png"),
  },
  {
    id: "5",
    name: "Pimentos",
    unitPrice: 12000,
    quantity: 1,
    unit: "kg",
    image: require("../../assets/tomate.png"),
  },
];

const formatPrice = (value: number): string => {
  return value.toLocaleString("pt-AO") + " Kzs";
};

export default function CartScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(initialCartItems);
  const { t } = useTranslation();

  const totalItems = cartItems.length;
  const totalPrice = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cartItems]);

  const handleIncrement = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id: string) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      t("attention"),
      t("confirmRemoveItem"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          style: "destructive",
          onPress: () => {
            setCartItems((prev) => prev.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const handlePayment = () => {
    setModalVisible(false);
    console.log("Pagamento confirmado");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Payment Modal */}
      <PaymentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handlePayment}
        totalAmount={formatPrice(totalPrice)}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t("cart")}</Text>
      </View>

      {/* Total Summary */}
      <View style={styles.summaryContainer}>
        <Text style={styles.summarySubtitle}>
          {totalItems} {t("itemsInCart")}
        </Text>
        <Text style={styles.summaryTotal}>{t("total")} {formatPrice(totalPrice)}</Text>
      </View>

      {/* Pay Button */}
      <TouchableOpacity
        style={[styles.payButton, totalItems === 0 && styles.payButtonDisabled]}
        onPress={() => totalItems > 0 && setModalVisible(true)}
        disabled={totalItems === 0}
      >
        <Text style={styles.payButtonText}>{t("payNow")}</Text>
      </TouchableOpacity>

      {/* Cart Items List */}
      {totalItems > 0 ? (
        <FlatList
          data={cartItems}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              <Image source={item.image} style={styles.itemImage} />
              <View style={styles.itemDetails}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.trashButton}
                    onPress={() => handleRemove(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={20} color="#E53935" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.unitPrice)} / {item.unit}
                </Text>
                <View style={styles.itemBottomRow}>
                  {/* Quantity Counter */}
                  <View style={styles.quantityCounter}>
                    <TouchableOpacity
                      style={[
                        styles.counterButton,
                        item.quantity <= 1 && styles.counterButtonDisabled,
                      ]}
                      onPress={() => handleDecrement(item.id)}
                      disabled={item.quantity <= 1}
                    >
                      <Ionicons
                        name="remove"
                        size={16}
                        color={item.quantity <= 1 ? "#ccc" : "#22C55E"}
                      />
                    </TouchableOpacity>
                    <Text style={styles.counterValue}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.counterButton}
                      onPress={() => handleIncrement(item.id)}
                    >
                      <Ionicons name="add" size={16} color="#22C55E" />
                    </TouchableOpacity>
                  </View>
                  {/* Subtotal */}
                  <Text style={styles.itemSubtotal}>
                    {formatPrice(item.unitPrice * item.quantity)}
                  </Text>
                </View>
              </View>
            </View>
          )}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={60} color="#ddd" />
          <Text style={styles.emptyText}>{t("emptyCart")}</Text>
          <Text style={styles.emptySubText}>{t("addItemsToCart")}</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  summaryContainer: {
    backgroundColor: "#D4F4E7",
    marginHorizontal: 20,
    marginTop: 10,
    padding: 16,
    borderRadius: 12,
  },
  summarySubtitle: {
    fontSize: 14,
    color: "#2E7D5E",
    marginBottom: 4,
  },
  summaryTotal: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1B5E3F",
  },
  payButton: {
    backgroundColor: "#22C55E",
    marginHorizontal: 20,
    marginTop: 15,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  payButtonDisabled: {
    backgroundColor: "#ccc",
    shadowOpacity: 0,
    elevation: 0,
  },
  payButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 10,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  trashButton: {
    padding: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  quantityCounter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  counterButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  counterButtonDisabled: {
    backgroundColor: "#F9F9F9",
    shadowOpacity: 0,
    elevation: 0,
  },
  counterValue: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1B5E3F",
    minWidth: 32,
    textAlign: "center",
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: "700",
    color: "#22C55E",
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