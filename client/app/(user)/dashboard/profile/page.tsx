"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { Button } from "@/shared/components/atoms/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/atoms/ui/card";
import { Input } from "@/shared/components/atoms/ui/input";
import { Label } from "@/shared/components/atoms/ui/label";
import { Textarea } from "@/shared/components/atoms/ui/textarea";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera,
  Save,
  Shield
} from "lucide-react";
import { useState } from "react";

export default function ProfilePage() {
  const { isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  const handleSave = () => {
    setIsEditing(false);
    console.log("Profil sauvegardé");
  };

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mon Profil</h1>
          <p className="text-gray-600 mt-1">
            Gérez vos informations personnelles et préférences
          </p>
        </div>
        <Button 
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
        >
          {isEditing ? "Annuler" : "Modifier"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Photo de profil */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photo de profil
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="h-16 w-16 text-gray-400" />
            </div>
            <Button variant="outline" size="sm">
              Changer la photo
            </Button>
          </CardContent>
        </Card>

        {/* Informations principales */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
            <CardDescription>
              Vos informations de base et coordonnées
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input
                  id="firstName"
                  defaultValue="Jean"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input
                  id="lastName"
                  defaultValue="Dupont"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  defaultValue="jean.dupont@email.com"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <Input
                  id="phone"
                  defaultValue="+33 6 12 34 56 78"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Adresse</Label>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-3" />
                <Textarea
                  id="address"
                  defaultValue="123 Rue de la République&#10;75001 Paris, France"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-gray-50" : ""}
                  rows={3}
                />
              </div>
            </div>

            {isEditing && (
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSave} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sauvegarder
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  Annuler
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Sécurité et confidentialité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité et confidentialité
          </CardTitle>
          <CardDescription>
            Gérez la sécurité de votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Mot de passe</h4>
              <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
            </div>
            <Button variant="outline" size="sm">
              Modifier
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Authentification à deux facteurs</h4>
              <p className="text-sm text-gray-600">Sécurisez votre compte avec 2FA</p>
            </div>
            <Button variant="outline" size="sm">
              Activer
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h4 className="font-medium">Sessions actives</h4>
              <p className="text-sm text-gray-600">Gérer vos appareils connectés</p>
            </div>
            <Button variant="outline" size="sm">
              Voir tout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
