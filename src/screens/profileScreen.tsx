import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { useAuth } from "../context/AuthContext";

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [nome, setNome] = useState(user?.name || "");
  const [telefone, setTelefone] = useState(user?.phone || "");
  const [email, setEmail] = useState(user?.email || "");
  const [nif, setNif] = useState(user?.company_nif || "");
  const [empresa, setEmpresa] = useState(user?.company_name || "");
  const [photoUri, setPhotoUri] = useState<string | null>(user?.photo || null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setNome(user.name);
      setEmail(user.email);
      setTelefone(user.phone || "");
      setNif(user.company_nif || "");
      setEmpresa(user.company_name || "");
      setPhotoUri(user.photo || null);
    }
  }, [user]);

  const handlePickPhoto = async () => {
    // Ask permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de acesso à galeria para selecionar sua foto."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permissão Necessária",
        "Precisamos de acesso à câmera para tirar a foto."
      );
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const showPhotoOptions = () => {
    Alert.alert("Foto de Perfil", "Escolha uma opção", [
      { text: "Tirar Foto", onPress: handleTakePhoto },
      { text: "Escolher da Galeria", onPress: handlePickPhoto },
      ...(photoUri
        ? [
          {
            text: "Remover Foto",
            style: "destructive" as const,
            onPress: () => setPhotoUri(null),
          },
        ]
        : []),
      { text: "Cancelar", style: "cancel" as const },
    ]);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalPhoto = photoUri;

      // Se for um URI local (file://), converter para Base64 para persistência
      if (photoUri && photoUri.startsWith("file://")) {
        try {
          const base64 = await FileSystem.readAsStringAsync(photoUri, {
            encoding: "base64",
          });
          finalPhoto = `data:image/jpeg;base64,${base64}`;
        } catch (err) {
          console.error("Erro ao converter imagem p/ base64:", err);
          // Se falhar o base64, tenta mandar o URI (pode não funcionar depois, mas evita erro agora)
        }
      }

      await updateProfile({
        name: nome,
        phone: telefone,
        company_nif: nif,
        company_name: empresa,
        photo: finalPhoto || undefined,
      });
      setIsEditing(false);
      Alert.alert("Sucesso", "Perfil atualizado com sucesso!");
    } catch (error: any) {
      Alert.alert("Erro", error.message || "Falha ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sair",
          style: "destructive",
          onPress: () => {
            signOut();
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restore original values
    if (user) {
      setNome(user.name);
      setEmail(user.email);
      setTelefone(user.phone || "");
      setNif(user.company_nif || "");
      setEmpresa(user.company_name || "");
      setPhotoUri(user.photo || null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View style={{ width: 24 }} />
        <Text style={styles.headerTitle}>Perfil</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
          <Ionicons name={isEditing ? "close" : "pencil"} size={22} color="#1DD87C" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar com foto */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            style={styles.avatarCircle}
            onPress={isEditing ? showPhotoOptions : undefined}
            activeOpacity={isEditing ? 0.7 : 1}
          >
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={50} color="#999" />
            )}
          </TouchableOpacity>

          {/* Camera button - always visible */}
          <TouchableOpacity
            style={styles.editAvatarButton}
            onPress={showPhotoOptions}
          >
            <Ionicons name="camera" size={18} color="#1DD87C" />
          </TouchableOpacity>

          {/* User name under avatar */}
          <Text style={styles.avatarName}>{user?.name || "Usuário"}</Text>
          <Text style={styles.avatarEmail}>{user?.email || ""}</Text>
        </View>

        {/* Formulário */}
        <View style={styles.form}>
          {/* Nome */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nome</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={nome}
              onChangeText={setNome}
              editable={isEditing}
            />
          </View>

          {/* Telefone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Telefone</Text>
            <View style={[styles.phoneContainer, !isEditing && styles.phoneContainerDisabled]}>
              <View style={styles.countryCode}>
                <Image
                  source={{ uri: "https://flagcdn.com/w40/ao.png" }}
                  style={styles.flag}
                />
                <Text style={styles.phonePrefix}>+244</Text>
              </View>
              <TextInput
                style={[styles.phoneInput, !isEditing && styles.inputDisabled]}
                value={telefone}
                onChangeText={setTelefone}
                keyboardType="phone-pad"
                editable={isEditing}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={false}
            />
          </View>

          {/* NIF */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>NIF</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={nif}
              onChangeText={setNif}
              editable={isEditing}
            />
          </View>

          {/* Empresa */}
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Empresa</Text>
            <TextInput
              style={[styles.input, !isEditing && styles.inputDisabled]}
              value={empresa}
              onChangeText={setEmpresa}
              editable={isEditing}
            />
          </View>
        </View>

        {/* Botões de ação */}
        {isEditing && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.85}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.85}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.saveButtonText}>Salvar</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Opções de menu */}
        {!isEditing && (
          <View style={styles.menuSection}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate("PurchaseHistory")}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#D4F4E7" }]}>
                <Ionicons name="receipt-outline" size={18} color="#22C55E" />
              </View>
              <Text style={styles.menuItemText}>Histórico de Compra</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate("ValidateProvider")}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#DBEAFE" }]}>
                <Ionicons name="shield-checkmark-outline" size={18} color="#3B82F6" />
              </View>
              <Text style={styles.menuItemText}>Validar Prestador</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => (navigation as any).navigate("Help")}
            >
              <View style={[styles.menuIconCircle, { backgroundColor: "#FFF8E1" }]}>
                <Ionicons name="help-buoy-outline" size={18} color="#F59E0B" />
              </View>
              <Text style={styles.menuItemText}>Ajuda</Text>
              <Ionicons name="chevron-forward" size={18} color="#ccc" />
            </TouchableOpacity>
          </View>
        )}

        {/* Botão Sair */}
        {!isEditing && (
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF6B6B" />
            <Text style={styles.logoutButtonText}>Sair da Conta</Text>
          </TouchableOpacity>
        )}
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
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 15,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#000000",
  },
  editButton: {
    padding: 5,
  },
  avatarContainer: {
    alignSelf: "center",
    marginTop: 15,
    marginBottom: 25,
    position: "relative",
    alignItems: "center",
  },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "#22C55E",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  avatarName: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  avatarEmail: {
    marginTop: 2,
    fontSize: 13,
    color: "#999",
  },
  editAvatarButton: {
    position: "absolute",
    top: 70,
    right: -5,
    backgroundColor: "#FFFFFF",
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#1DD87C",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  form: {
    paddingHorizontal: 25,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 6,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  inputDisabled: {
    backgroundColor: "#FAFAFA",
    color: "#666666",
  },
  phoneContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 10,
    paddingLeft: 12,
    borderWidth: 1,
    borderColor: "#F5F5F5",
  },
  phoneContainerDisabled: {
    backgroundColor: "#FAFAFA",
  },
  countryCode: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 10,
    borderRightWidth: 1,
    borderRightColor: "#E0E0E0",
  },
  flag: {
    width: 20,
    height: 14,
    marginRight: 5,
  },
  phonePrefix: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "600",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#000000",
  },
  actionButtons: {
    flexDirection: "row",
    paddingHorizontal: 25,
    paddingTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#666666",
    fontSize: 15,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#1DD87C",
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#1DD87C",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFE5E5",
    backgroundColor: "#FFF5F5",
  },
  logoutButtonText: {
    marginLeft: 10,
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
  menuSection: {
    marginHorizontal: 25,
    marginTop: 16,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 14,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  menuIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  menuItemText: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
});