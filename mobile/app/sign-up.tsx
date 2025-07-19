import { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { authClient } from "../lib/auth/auth-client";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    try {
      setLoading(true);
      const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (error) {
        Alert.alert("Error", error.message);
        return;
      }

      Alert.alert("Success", "Account created successfully!");
      console.log("Signed up successfully:", data);
    } catch (error) {
      Alert.alert("Error", "Failed to sign up");
      console.error("Sign up error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <TextInput
        placeholder="Name"
        value={name}
        onChangeText={setName}
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
      />
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
        title={loading ? "Signing Up..." : "Sign Up"}
        onPress={handleSignUp}
        disabled={loading}
      />
    </View>
  );
}
