import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    Alert,
    ActivityIndicator,
    Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

type ValidationResult = "idle" | "loading" | "valid" | "invalid";

interface ProviderInfo {
    name: string;
    nif: string;
    category: string;
    location: string;
    status: string;
    rating: number;
    since: string;
}

const mockProviders: Record<string, ProviderInfo> = {
    "123456789": {
        name: "Fazenda Verde Ltda",
        nif: "123456789",
        category: "Hortaliças",
        location: "Luanda, Angola",
        status: "Ativo",
        rating: 4,
        since: "Jan 2024",
    },
    "987654321": {
        name: "AgroFresh Angola",
        nif: "987654321",
        category: "Frutas e Legumes",
        location: "Benguela, Angola",
        status: "Ativo",
        rating: 5,
        since: "Mar 2023",
    },
    "111222333": {
        name: "Prestador Suspenso SA",
        nif: "111222333",
        category: "Cereais",
        location: "Huambo, Angola",
        status: "Suspenso",
        rating: 2,
        since: "Jun 2025",
    },
};

export default function ValidateProviderScreen() {
    const navigation = useNavigation();
    const [nifInput, setNifInput] = useState("");
    const [result, setResult] = useState<ValidationResult>("idle");
    const [providerData, setProviderData] = useState<ProviderInfo | null>(null);
    const [inputFocused, setInputFocused] = useState(false);
    const { t } = useTranslation();

    const handleValidate = () => {
        if (!nifInput.trim()) {
            Alert.alert(t("attention"), t("enterProviderNIF"));
            return;
        }

        setResult("loading");
        setProviderData(null);

        // Simula espera de resposta
        setTimeout(() => {
            const found = mockProviders[nifInput.trim()];
            if (found) {
                setProviderData(found);
                setResult("valid");
            } else {
                setResult("invalid");
            }
        }, 1500);
    };

    const handleClear = () => {
        setNifInput("");
        setResult("idle");
        setProviderData(null);
    };

    const renderStars = (rating: number) => (
        <View style={styles.starsContainer}>
            {[...Array(5)].map((_, index) => (
                <Ionicons
                    key={index}
                    name="star"
                    size={14}
                    color={index < rating ? "#FFD700" : "#E0E0E0"}
                />
            ))}
        </View>
    );

    const isActive = providerData?.status === "Ativo";

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t("validateProviderTitle")}</Text>
                <View style={{ width: 24 }} />
            </View>

            {/* Intro */}
            <View style={styles.introContainer}>
                <View style={styles.introIconCircle}>
                    <Ionicons name="shield-checkmark-outline" size={28} color="#22C55E" />
                </View>
                <Text style={styles.introTitle}>{t("providerVerification")}</Text>
                <Text style={styles.introSubtitle}>
                    {t("providerVerificationDesc")}
                </Text>
            </View>

            {/* Input */}
            <View style={styles.inputSection}>
                <Text style={styles.inputLabel}>{t("providerNIF")}</Text>
                <View
                    style={[
                        styles.inputContainer,
                        inputFocused && styles.inputContainerFocused,
                    ]}
                >
                    <Ionicons name="document-text-outline" size={20} color="#999" />
                    <TextInput
                        style={styles.input}
                        placeholder="Ex: 123456789"
                        placeholderTextColor="#bbb"
                        value={nifInput}
                        onChangeText={setNifInput}
                        keyboardType="number-pad"
                        onFocus={() => setInputFocused(true)}
                        onBlur={() => setInputFocused(false)}
                    />
                    {nifInput.length > 0 && (
                        <TouchableOpacity onPress={handleClear}>
                            <Ionicons name="close-circle" size={20} color="#ccc" />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    style={[
                        styles.validateButton,
                        result === "loading" && styles.validateButtonDisabled,
                    ]}
                    onPress={handleValidate}
                    disabled={result === "loading"}
                    activeOpacity={0.85}
                >
                    {result === "loading" ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <>
                            <Ionicons name="search-outline" size={18} color="#fff" />
                            <Text style={styles.validateButtonText}>{t("validate")}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </View>

            {/* NIFs de teste */}
            <View style={styles.hintContainer}>
                <Ionicons name="information-circle-outline" size={14} color="#999" />
                <Text style={styles.hintText}>
                    {t("testNIFs")}
                </Text>
            </View>

            {/* Result */}
            {result === "valid" && providerData && (
                <View style={styles.resultCard}>
                    <View style={styles.resultHeader}>
                        <View
                            style={[
                                styles.resultIconCircle,
                                { backgroundColor: isActive ? "#D4F4E7" : "#FFE5E5" },
                            ]}
                        >
                            <Ionicons
                                name={isActive ? "checkmark-circle" : "warning"}
                                size={28}
                                color={isActive ? "#22C55E" : "#E53935"}
                            />
                        </View>
                        <View style={styles.resultHeaderInfo}>
                            <Text style={styles.resultName}>{providerData.name}</Text>
                            <View
                                style={[
                                    styles.statusBadge,
                                    {
                                        backgroundColor: isActive ? "#D4F4E7" : "#FFE5E5",
                                    },
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.statusBadgeText,
                                        { color: isActive ? "#1B8A4E" : "#E53935" },
                                    ]}
                                >
                                    {providerData.status}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={styles.resultDivider} />

                    <View style={styles.resultDetails}>
                        <View style={styles.detailRow}>
                            <Ionicons name="card-outline" size={16} color="#999" />
                            <Text style={styles.detailLabel}>{t("nif")}</Text>
                            <Text style={styles.detailValue}>{providerData.nif}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="pricetag-outline" size={16} color="#999" />
                            <Text style={styles.detailLabel}>{t("category")}</Text>
                            <Text style={styles.detailValue}>{providerData.category}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={16} color="#999" />
                            <Text style={styles.detailLabel}>{t("location")}</Text>
                            <Text style={styles.detailValue}>{providerData.location}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="calendar-outline" size={16} color="#999" />
                            <Text style={styles.detailLabel}>{t("since")}</Text>
                            <Text style={styles.detailValue}>{providerData.since}</Text>
                        </View>
                        <View style={styles.detailRow}>
                            <Ionicons name="star-outline" size={16} color="#999" />
                            <Text style={styles.detailLabel}>{t("ratingLabel")}</Text>
                            {renderStars(providerData.rating)}
                        </View>
                    </View>
                </View>
            )}

            {result === "invalid" && (
                <View style={styles.invalidCard}>
                    <Ionicons name="close-circle" size={44} color="#E53935" />
                    <Text style={styles.invalidTitle}>{t("providerNotFound")}</Text>
                    <Text style={styles.invalidSubtitle}>
                        {t("providerNotFoundDesc")}
                    </Text>
                </View>
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
        marginBottom: 24,
    },
    introIconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#D4F4E7",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 12,
    },
    introTitle: {
        fontSize: 18,
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
    inputSection: {
        paddingHorizontal: 20,
    },
    inputLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#333",
        marginBottom: 6,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F5F7FA",
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        borderWidth: 2,
        borderColor: "transparent",
        gap: 10,
    },
    inputContainerFocused: {
        borderColor: "#22C55E",
        backgroundColor: "#fff",
    },
    input: {
        flex: 1,
        fontSize: 15,
        color: "#000",
    },
    validateButton: {
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
    validateButtonDisabled: {
        opacity: 0.7,
    },
    validateButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
    hintContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        gap: 4,
    },
    hintText: {
        fontSize: 11,
        color: "#999",
    },
    resultCard: {
        marginHorizontal: 20,
        marginTop: 22,
        backgroundColor: "#fff",
        borderRadius: 14,
        padding: 18,
        shadowColor: "#000",
        shadowOpacity: 0.08,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 4,
        borderWidth: 1,
        borderColor: "#F0F0F0",
    },
    resultHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
    },
    resultIconCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: "center",
        justifyContent: "center",
    },
    resultHeaderInfo: {
        flex: 1,
    },
    resultName: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#000",
        marginBottom: 4,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: "600",
    },
    resultDivider: {
        height: 1,
        backgroundColor: "#F0F0F0",
        marginVertical: 14,
    },
    resultDetails: {
        gap: 10,
    },
    detailRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    detailLabel: {
        fontSize: 13,
        color: "#888",
        width: 85,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#333",
    },
    starsContainer: {
        flexDirection: "row",
        gap: 3,
    },
    invalidCard: {
        marginHorizontal: 20,
        marginTop: 22,
        backgroundColor: "#FFF5F5",
        borderRadius: 14,
        padding: 24,
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#FFE5E5",
    },
    invalidTitle: {
        fontSize: 17,
        fontWeight: "bold",
        color: "#E53935",
        marginTop: 10,
    },
    invalidSubtitle: {
        fontSize: 13,
        color: "#CC7A7A",
        textAlign: "center",
        marginTop: 6,
        lineHeight: 19,
    },
});
