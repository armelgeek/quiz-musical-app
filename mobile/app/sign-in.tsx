import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { authClient } from "../lib/auth/auth-client";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const { data, error } = await authClient.signIn.email({
        email,
        password,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      // Navigation will be handled by your app's auth state
      console.log("Signed in successfully:", data);
    } catch (error) {
      Alert.alert("Error", "Failed to sign in");
      console.error("Sign in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        secureTextEntry
      />
      <Button
        title={loading ? "Signing In..." : "Sign In"}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
}
