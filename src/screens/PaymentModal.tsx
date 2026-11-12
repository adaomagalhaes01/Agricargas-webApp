import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UploadProofModal from "./UploadProofModal";
import { useTranslation } from "react-i18next";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (address: string, file: any) => void;
  totalAmount: string;
}

export default function PaymentModal({
  visible,
  onClose,
  onConfirm,
  totalAmount,
}: PaymentModalProps) {
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(true);
  const [address, setAddress] = useState("");
  const { t } = useTranslation();

  const handlePaymentClick = () => {
    if (!address.trim()) {
      Alert.alert(t("attention"), t("addressRequired"));
      return;
    }
    // Fecha o modal de pagamento primeiro, depois abre o de upload
    setPaymentModalVisible(false);
    setTimeout(() => {
      setUploadModalVisible(true);
    }, 300);
  };

  const handleUploadConfirm = (file: any) => {
    setUploadModalVisible(false);
    setPaymentModalVisible(true);
    onConfirm(address, file);
  };

  const handleCloseUpload = () => {
    setUploadModalVisible(false);
    // Reabre o modal de pagamento
    setTimeout(() => {
      setPaymentModalVisible(true);
    }, 300);
  };

  const handleClose = () => {
    setPaymentModalVisible(true);
    setUploadModalVisible(false);
    onClose();
  };

  // Quando o modal principal fica visível de novo, reseta o estado
  React.useEffect(() => {
    if (visible) {
      setPaymentModalVisible(true);
      setUploadModalVisible(false);
    }
  }, [visible]);

  const showPayment = visible && paymentModalVisible && !uploadModalVisible;
  const showUpload = uploadModalVisible;

  return (
    <>
      {/* Payment Modal */}
      <Modal
        visible={showPayment}
        transparent={true}
        animationType="slide"
        onRequestClose={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.overlay}
        >
          <View style={styles.modalContainer}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center' }}>
              {/* Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="location-outline" size={60} color="#22C55E" />
              </View>

              {/* Title */}
              <Text style={styles.title}>{t("deliveryInfo")}</Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>{t("deliveryAddress")}</Text>
                <TextInput
                  style={styles.addressInput}
                  placeholder={t("addressPlaceholder")}
                  value={address}
                  onChangeText={setAddress}
                  multiline
                  numberOfLines={3}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.iconContainerSmall}>
                <Ionicons name="wallet-outline" size={30} color="#22C55E" />
              </View>

              {/* IBAN */}
              <Text style={styles.iban}>Iban:0040.0000.5312.5104.1015.9</Text>

              <Text style={styles.description}>
                {t("ibanDescription")}
              </Text>

              {/* Amount */}
              <Text style={styles.amount}>{t("total")} {totalAmount}</Text>

              {/* Confirm Button */}
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handlePaymentClick}
                activeOpacity={0.85}
              >
                <Text style={styles.confirmButtonText}>{t("makePayment")}</Text>
              </TouchableOpacity>

              {/* Close Button */}
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>{t("close")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Upload Proof Modal */}
      <UploadProofModal
        visible={showUpload}
        onClose={handleCloseUpload}
        onConfirm={handleUploadConfirm}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    width: "100%",
    maxHeight: "85%",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  iconContainer: {
    width: 90,
    height: 90,
    backgroundColor: "#E8F8F0",
    borderRadius: 45,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  iconContainerSmall: {
    width: 60,
    height: 60,
    backgroundColor: "#E8F8F0",
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 8,
  },
  addressInput: {
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontSize: 15,
    color: "#333",
    textAlignVertical: "top",
    minHeight: 80,
  },
  divider: {
    width: "100%",
    height: 1,
    backgroundColor: "#F0F0F0",
    marginBottom: 20,
  },
  iban: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 12,
    paddingHorizontal: 10,
  },
  amount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#22C55E",
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#22C55E",
    borderRadius: 12,
    paddingVertical: 16,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#22C55E",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  confirmButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    paddingVertical: 10,
    marginBottom: 20,
  },
  closeButtonText: {
    color: "#999",
    fontSize: 14,
    fontWeight: "500",
  },
});