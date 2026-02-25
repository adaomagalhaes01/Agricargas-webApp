import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
    ScrollView,
    TextInput,
    Alert,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

interface FAQItem {
    id: string;
    question: string;
    answer: string;
}

const faqData: FAQItem[] = [
    {
        id: "1",
        question: "Como faço para realizar uma compra?",
        answer:
            "Para realizar uma compra, navegue pelo catálogo de produtos, selecione os itens desejados, adicione ao carrinho e finalize o pedido seguindo as instruções de pagamento.",
    },
    {
        id: "2",
        question: "Como posso rastrear meu pedido?",
        answer:
            "Acesse a secção 'Histórico de Compra' no menu lateral. Lá poderá ver o estado de cada pedido (Pendente, Entregue ou Cancelado) com todos os detalhes.",
    },
    {
        id: "3",
        question: "Como validar um prestador ou fornecedor?",
        answer:
            "Use a funcionalidade 'Validar Prestador' no menu lateral. Insira o NIF do prestador para verificar se está registado e certificado na plataforma AgriCargas.",
    },
    {
        id: "4",
        question: "Quais são as formas de pagamento aceites?",
        answer:
            "Aceitamos pagamento via Multicaixa Express, transferência bancária e pagamento na entrega. As opções disponíveis são apresentadas no momento do checkout.",
    },
    {
        id: "5",
        question: "Como posso atualizar meus dados de perfil?",
        answer:
            "Acesse o seu Perfil pelo menu lateral, clique no ícone de editar (lápis) no canto superior direito. Após editar as informações, clique em 'Salvar'.",
    },
    {
        id: "6",
        question: "Posso cancelar um pedido já feito?",
        answer:
            "Sim, pode cancelar pedidos com estado 'Pendente'. Acesse o Histórico de Compra, selecione o pedido e clique em cancelar. Pedidos já processados não podem ser cancelados.",
    },
];

export default function HelpScreen() {
    const navigation = useNavigation();
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [contactMessage, setContactMessage] = useState("");
    const [messageFocused, setMessageFocused] = useState(false);
    const { t } = useTranslation();

    const faqItems: FAQItem[] = [
        { id: "1", question: t("faq1q"), answer: t("faq1a") },
        { id: "2", question: t("faq2q"), answer: t("faq2a") },
        { id: "3", question: t("faq3q"), answer: t("faq3a") },
        { id: "4", question: t("faq4q"), answer: t("faq4a") },
        { id: "5", question: t("faq5q"), answer: t("faq5a") },
        { id: "6", question: t("faq6q"), answer: t("faq6a") },
    ];

    const toggleFAQ = (id: string) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleSendMessage = () => {
        if (!contactMessage.trim()) {
            Alert.alert(t("attention"), t("writeMessageFirst"));
            return;
        }
        Alert.alert(
            t("messageSent"),
            t("messageSentDesc"),
            [{ text: t("ok"), onPress: () => setContactMessage("") }]
        );
    };

    const handleCall = () => {
        Linking.openURL("tel:+244923456789");
    };

    const handleEmail = () => {
        Linking.openURL("mailto:suporte@agricargas.ao");
    };

    const handleWhatsApp = () => {
        Linking.openURL("https://wa.me/244923456789");
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("helpTitle")}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Intro */}
                <View style={styles.introContainer}>
                    <View style={styles.introIconCircle}>
                        <Ionicons name="help-buoy-outline" size={30} color="#22C55E" />
                    </View>
                    <Text style={styles.introTitle}>{t("howCanWeHelp")}</Text>
                    <Text style={styles.introSubtitle}>
                        {t("helpSubtitle")}
                    </Text>
                </View>

                {/* Quick Contact */}
                <View style={styles.quickContactContainer}>
                    <TouchableOpacity style={styles.quickContactCard} onPress={handleCall}>
                        <View style={[styles.quickContactIcon, { backgroundColor: "#D4F4E7" }]}>
                            <Ionicons name="call-outline" size={22} color="#22C55E" />
                        </View>
                        <Text style={styles.quickContactLabel}>{t("call")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickContactCard} onPress={handleEmail}>
                        <View style={[styles.quickContactIcon, { backgroundColor: "#E8EAFF" }]}>
                            <Ionicons name="mail-outline" size={22} color="#5B6AEE" />
                        </View>
                        <Text style={styles.quickContactLabel}>{t("emailContact")}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.quickContactCard} onPress={handleWhatsApp}>
                        <View style={[styles.quickContactIcon, { backgroundColor: "#D4F4E7" }]}>
                            <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
                        </View>
                        <Text style={styles.quickContactLabel}>{t("whatsApp")}</Text>
                    </TouchableOpacity>
                </View>

                {/* FAQ Section */}
                <View style={styles.faqSection}>
                    <Text style={styles.sectionTitle}>{t("faq")}</Text>

                    {faqItems.map((item) => {
                        const isExpanded = expandedId === item.id;
                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.faqCard, isExpanded && styles.faqCardExpanded]}
                                onPress={() => toggleFAQ(item.id)}
                                activeOpacity={0.7}
                            >
                                <View style={styles.faqHeader}>
                                    <Text style={[styles.faqQuestion, isExpanded && styles.faqQuestionExpanded]}>
                                        {item.question}
                                    </Text>
                                    <Ionicons
                                        name={isExpanded ? "chevron-up" : "chevron-down"}
                                        size={18}
                                        color={isExpanded ? "#22C55E" : "#999"}
                                    />
                                </View>
                                {isExpanded && (
                                    <Text style={styles.faqAnswer}>{item.answer}</Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Contact Form */}
                <View style={styles.contactSection}>
                    <Text style={styles.sectionTitle}>{t("sendMessage")}</Text>
                    <Text style={styles.contactSubtitle}>
                        {t("sendMessageSubtitle")}
                    </Text>

                    <TextInput
                        style={[
                            styles.messageInput,
                            messageFocused && styles.messageInputFocused,
                        ]}
                        placeholder={t("writeYourQuestion")}
                        placeholderTextColor="#bbb"
                        multiline
                        numberOfLines={4}
                        textAlignVertical="top"
                        value={contactMessage}
                        onChangeText={setContactMessage}
                        onFocus={() => setMessageFocused(true)}
                        onBlur={() => setMessageFocused(false)}
                    />

                    <TouchableOpacity
                        style={styles.sendButton}
                        onPress={handleSendMessage}
                        activeOpacity={0.85}
                    >
                        <Ionicons name="send-outline" size={18} color="#fff" />
                        <Text style={styles.sendButtonText}>{t("sendMessageBtn")}</Text>
                    </TouchableOpacity>
                </View>

                {/* App Info */}
                <View style={styles.appInfoContainer}>
                    <Text style={styles.appInfoVersion}>AgriCargas v1.0.0</Text>
                    <Text style={styles.appInfoCopyright}>
                        © 2026 AgriCargas. Todos os direitos reservados.
                    </Text>
                </View>
            </ScrollView>
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
        justifyContent: "space-between",
        alignItems: "center",
        paddingHorizontal: 20,
        paddingTop: 50,
        paddingBottom: 15,
    },
    backButton: {
        padding: 5,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
    },
    introContainer: {
        alignItems: "center",
        paddingHorizontal: 30,
        marginTop: 10,
        marginBottom: 20,
    },
    introIconCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#D4F4E7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    introTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#000",
        marginBottom: 6,
    },
    introSubtitle: {
        fontSize: 13,
        color: "#888",
        textAlign: "center",
        lineHeight: 19,
    },
    quickContactContainer: {
        flexDirection: "row",
        justifyContent: "center",
        paddingHorizontal: 20,
        gap: 16,
        marginBottom: 24,
    },
    quickContactCard: {
        alignItems: "center",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 14,
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
        borderWidth: 1,
        borderColor: "#F0F0F0",
        flex: 1,
    },
    quickContactIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 6,
    },
    quickContactLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#444",
    },
    faqSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#000",
        marginBottom: 14,
    },
    faqCard: {
        backgroundColor: "#F9FAFB",
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    faqCardExpanded: {
        backgroundColor: "#fff",
        borderColor: "#22C55E",
        shadowColor: "#22C55E",
        shadowOpacity: 0.08,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    faqHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    faqQuestion: {
        flex: 1,
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
        marginRight: 10,
    },
    faqQuestionExpanded: {
        color: "#22C55E",
    },
    faqAnswer: {
        marginTop: 10,
        fontSize: 13,
        color: "#666",
        lineHeight: 20,
    },
    contactSection: {
        paddingHorizontal: 20,
        marginBottom: 24,
    },
    contactSubtitle: {
        fontSize: 13,
        color: "#888",
        marginBottom: 12,
        marginTop: -6,
    },
    messageInput: {
        backgroundColor: "#F5F7FA",
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 14,
        fontSize: 14,
        color: "#000",
        minHeight: 100,
        borderWidth: 2,
        borderColor: "transparent",
    },
    messageInputFocused: {
        borderColor: "#22C55E",
        backgroundColor: "#fff",
    },
    sendButton: {
        flexDirection: "row",
        backgroundColor: "#22C55E",
        marginTop: 14,
        paddingVertical: 15,
        borderRadius: 10,
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        shadowColor: "#22C55E",
        shadowOpacity: 0.3,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
    },
    sendButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    appInfoContainer: {
        alignItems: "center",
        paddingVertical: 20,
        marginBottom: 30,
    },
    appInfoVersion: {
        fontSize: 13,
        fontWeight: "600",
        color: "#bbb",
    },
    appInfoCopyright: {
        fontSize: 11,
        color: "#ddd",
        marginTop: 4,
    },
});
