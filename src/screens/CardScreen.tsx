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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import PaymentModal from "./PaymentModal";
import { useTranslation } from "react-i18next";
import { useCart } from "../context/CartContext";
import { useAuth, API_URL } from "../context/AuthContext";
import * as FileSystem from 'expo-file-system/legacy';

const formatPrice = (value: number): string => {
  return (value || 0).toLocaleString("pt-AO") + " Kzs";
};

export default function CartScreen({ navigation }: any) {
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { items: cartItems, updateQuantity, removeFromCart, clearCart, totalPrice, totalItems } = useCart();
  const { user } = useAuth();
  const { t } = useTranslation();

  const handleIncrement = (id: string, current: number) => {
    updateQuantity(id, current + 1);
  };

  const handleDecrement = (id: string, current: number) => {
    if (current > 1) {
      updateQuantity(id, current - 1);
    }
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
          onPress: () => removeFromCart(id),
        },
      ]
    );
  };

  const handleConfirmOrder = async (address: string, file: any) => {
    if (!user) {
      Alert.alert(t("error"), t("loginRequired"));
      return;
    }

    setIsSubmitting(true);
    setModalVisible(false);

    try {
      let proofBase64 = null;
      if (file && file.uri) {
        try {
          const base64Content = await FileSystem.readAsStringAsync(file.uri, {
            encoding: 'base64',
          });

          // Construct Data URL
          const mimeType = file.mimeType || (file.uri.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');
          proofBase64 = `data:${mimeType};base64,${base64Content}`;
        } catch (fsError) {
          console.error("Erro ao ler ficheiro:", fsError);
        }
      }

      const orderData = {
        user_id: user.id,
        delivery_address: address,
        total: totalPrice,
        items: cartItems.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price
        })),
        payment_proof: proofBase64
      };

      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        clearCart();
        Alert.alert(t("success"), t("orderPlacedSuccess") || "Encomenda realizada com sucesso!");
        navigation.navigate("MainMenu");
      } else {
        const error = await res.json();
        Alert.alert(t("error"), error.message || "Erro ao processar encomenda");
      }
    } catch (error) {
      console.error("Erro ao enviar encomenda:", error);
      Alert.alert(t("error"), "Erro de conexão com o servidor");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Payment Modal */}
      <PaymentModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onConfirm={handleConfirmOrder}
        totalAmount={formatPrice(totalPrice)}
      />

      {isSubmitting && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#22C55E" />
          <Text style={styles.loadingText}>{t("processingOrder") || "Processando Encomenda..."}</Text>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("cart")}</Text>
        <View style={{ width: 40 }} />
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
        disabled={totalItems === 0 || isSubmitting}
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
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.itemImage} />
              ) : (
                <View style={[styles.itemImage, { backgroundColor: '#f0f0f0', alignItems: 'center', justifyContent: 'center' }]}>
                  <Ionicons name="leaf-outline" size={30} color="#ccc" />
                </View>
              )}
              <View style={styles.itemDetails}>
                <View style={styles.itemTopRow}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <TouchableOpacity
                    style={styles.trashButton}
                    onPress={() => handleRemove(item.id)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="trash-outline" size={18} color="#E53935" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemPrice}>
                  {formatPrice(item.price)} / {item.unit || 'un'}
                </Text>
                <View style={styles.itemBottomRow}>
                  {/* Quantity Counter */}
                  <View style={styles.quantityCounter}>
                    <TouchableOpacity
                      style={[
                        styles.counterButton,
                        item.quantity <= 1 && styles.counterButtonDisabled,
                      ]}
                      onPress={() => handleDecrement(item.id, item.quantity)}
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
                      onPress={() => handleIncrement(item.id, item.quantity)}
                    >
                      <Ionicons name="add" size={16} color="#22C55E" />
                    </TouchableOpacity>
                  </View>
                  {/* Subtotal */}
                  <Text style={styles.itemSubtotal}>
                    {formatPrice(item.price * item.quantity)}
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
          <TouchableOpacity
            style={styles.goShopBtn}
            onPress={() => navigation.navigate("MainMenu")}
          >
            <Text style={styles.goShopText}>{t("goShop") || "Ver Produtos"}</Text>
          </TouchableOpacity>
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: "#fff",
  },
  backBtn: {
    padding: 8,
    marginLeft: -10,
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
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    maxWidth: "85%",
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
    width: 28,
    height: 28,
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
    fontSize: 14,
    fontWeight: "700",
    color: "#1B5E3F",
    minWidth: 28,
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
    marginBottom: 20,
  },
  goShopBtn: {
    backgroundColor: '#22C55E15',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#22C55E30'
  },
  goShopText: {
    color: '#22C55E',
    fontWeight: 'bold',
    fontSize: 14,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.8)',
    zIndex: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#22C55E',
    fontWeight: '600'
  }
});