import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import UploadProofModal from "./UploadProofModal";
import { useTranslation } from "react-i18next";

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
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
  const { t } = useTranslation();

  const handlePaymentClick = () => {
    // Fecha o modal de pagamento primeiro, depois abre o de upload
    setPaymentModalVisible(false);
    setTimeout(() => {
      setUploadModalVisible(true);
    }, 300);
  };

  const handleUploadConfirm = (file: any) => {
    console.log("Comprovativo enviado:", file);
    setUploadModalVisible(false);
    setPaymentModalVisible(true);
    onConfirm();
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
        animationType="fade"
        onRequestClose={handleClose}
      >
        <View style={styles.overlay}>
          <View style={styles.modalContainer}>
            {/* Icon */}
            <View style={styles.iconContainer}>
              <Ionicons name="wallet-outline" size={60} color="#22C55E" />
            </View>

            {/* Title */}
            <Text style={styles.title}>{t("payment")}</Text>

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
          </View>
        </View>
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
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  iconContainer: {
    width: 100,
    height: 100,
    backgroundColor: "#E8F8F0",
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 12,
  },
  iban: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  description: {
    fontSize: 13,
    color: "#666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 16,
    paddingHorizontal: 10,
  },
  amount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#22C55E",
    marginBottom: 20,
  },
  confirmButton: {
    backgroundColor: "#22C55E",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
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
  },
  closeButtonText: {
    color: "#666",
    fontSize: 14,
  },
});