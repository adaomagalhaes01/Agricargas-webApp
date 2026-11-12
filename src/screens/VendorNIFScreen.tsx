import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ImageBackground,
    StatusBar,
    ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

// 🔹 Tipagem das rotas principais
type RootStackParamList = {
    NextStep: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, "NextStep">;

export default function VendorNIFScreen() {
    const navigation = useNavigation<NavigationProp>();
    const { completeOnboarding } = useAuth();
    const { t } = useTranslation();
    const [nif, setNif] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNext = async () => {
        if (!nif.trim()) {
            alert(t("enterNif"));
            return;
        }

        setLoading(true);
        try {
            await completeOnboarding({
                profile_type: "vendor",
                company_nif: nif,
            });
            navigation.navigate("NextStep" as any);
        } catch (error: any) {
            alert(error.message || t("saveDataFailed"));
        } finally {
            setLoading(false);
        }
    };

    return (
        <ImageBackground
            source={require("../../assets/profile.png")}
            style={styles.background}
            resizeMode="cover"
        >
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

            <View style={styles.overlay} />

            <View style={styles.container}>
                {/* Conteúdo central */}
                <View style={styles.content}>
                    <Text style={styles.title}>
                        <Text style={styles.highlight}>{t("greetingVendor")}</Text>
                    </Text>
                    <Text style={styles.subtitle}>{t("howAreYou")}</Text>

                    <Text style={styles.description}>
                        {t("vendorNifDesc")}
                    </Text>

                    <TextInput
                        style={styles.input}
                        placeholder={t("nifPlaceholder")}
                        placeholderTextColor="#999"
                        value={nif}
                        onChangeText={setNif}
                        keyboardType="default"
                        autoCapitalize="characters"
                    />
                </View>

                {/* Seção inferior */}
                <View style={styles.bottomSection}>
                    {/* Botão Avançar */}
                    <TouchableOpacity
                        style={[styles.nextButton, loading && { opacity: 0.7 }]}
                        onPress={handleNext}
                        activeOpacity={0.85}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.nextButtonText}>{t("advance")}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Barra de progresso */}
                    <View style={styles.progressBarContainer}>
                        <View style={styles.progressBar} />
                    </View>
                </View>
            </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
    },
    container: {
        flex: 1,
        justifyContent: "space-between",
        paddingTop: 100,
        paddingBottom: 50,
    },
    content: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 40,
    },
    highlight: {
        color: "#1DD87C",
    },
    subtitle: {
        fontSize: 32,
        fontWeight: "800",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 16,
        lineHeight: 40,
    },
    description: {
        fontSize: 15,
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 22,
        fontWeight: "400",
    },
    input: {
        backgroundColor: "#FFFFFF",
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 16,
        fontSize: 16,
        width: "100%",
        marginTop: 30,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    bottomSection: {
        paddingHorizontal: 30,
        paddingBottom: 20,
    },
    nextButton: {
        backgroundColor: "#1DD87C",
        paddingVertical: 14,
        paddingHorizontal: 28,
        borderRadius: 12,
        alignSelf: "flex-end",
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        marginBottom: 20,
    },
    nextButtonText: {
        color: "#FFFFFF",
        fontSize: 16,
        fontWeight: "700",
        letterSpacing: 0.3,
    },
    progressBarContainer: {
        width: "100%",
        height: 4,
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        borderRadius: 2,
        overflow: "hidden",
    },

    progressBar: {
        width: "75%",
        height: "100%",
        backgroundColor: "#1DD87C",
        borderRadius: 2,
    },
});
