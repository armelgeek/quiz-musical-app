"use client";

import { useAuth } from "@/shared/providers/auth-provider";
import { Button } from "@/shared/components/atoms/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/atoms/ui/card";
import { Label } from "@/shared/components/atoms/ui/label";
import { Switch } from "@/shared/components/atoms/ui/switch";
import { 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Download,
  Trash2,
  Key,
  Smartphone,
  Mail,
} from "lucide-react";
import { useState } from "react";

export default function SettingsPage() {
  const { isLoading } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
    marketing: false
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* En-tête */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-600 mt-1">
          Configurez votre compte et vos préférences
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez comment vous souhaitez être notifié
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Notifications par email
                </Label>
                <p className="text-xs text-gray-500">
                  Recevoir les mises à jour importantes par email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, email: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Notifications push
                </Label>
                <p className="text-xs text-gray-500">
                  Notifications dans le navigateur
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, push: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="sms-notifications" className="text-sm font-medium">
                  SMS
                </Label>
                <p className="text-xs text-gray-500">
                  Alertes importantes par SMS
                </p>
              </div>
              <Switch
                id="sms-notifications"
                checked={notifications.sms}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, sms: checked }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="marketing-notifications" className="text-sm font-medium">
                  Communications marketing
                </Label>
                <p className="text-xs text-gray-500">
                  Nouveautés et offres spéciales
                </p>
              </div>
              <Switch
                id="marketing-notifications"
                checked={notifications.marketing}
                onCheckedChange={(checked) => 
                  setNotifications(prev => ({ ...prev, marketing: checked }))
                }
              />
            </div>

            <Button className="w-full">
              Sauvegarder les préférences
            </Button>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l&apos;apparence de l&apos;interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label className="text-sm font-medium">
                Langue de l&apos;interface
              </Label>
              <div className="mt-2">
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Globe className="h-4 w-4" />
                  Français (France)
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">
                  Animations réduites
                </Label>
                <p className="text-xs text-gray-500">
                  Diminuer les animations pour de meilleures performances
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Sécurité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Sécurité
            </CardTitle>
            <CardDescription>
              Gérez la sécurité de votre compte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Key className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Changer le mot de passe</p>
                  <p className="text-sm text-gray-600">Dernière modification il y a 3 mois</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Modifier
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Smartphone className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Authentification à deux facteurs</p>
                  <p className="text-sm text-gray-600">Non configurée</p>
                </div>
              </div>
              <Button size="sm">
                Activer
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Email de récupération</p>
                  <p className="text-sm text-gray-600">jean.dupont@email.com</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Modifier
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Données et vie privée */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Données et vie privée
            </CardTitle>
            <CardDescription>
              Gérez vos données personnelles
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Exporter mes données</p>
                <p className="text-sm text-gray-600">
                  Télécharger toutes vos données personnelles
                </p>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Exporter
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <p className="font-medium">Sessions actives</p>
                <p className="text-sm text-gray-600">
                  Voir et gérer vos appareils connectés
                </p>
              </div>
              <Button variant="outline" size="sm">
                Gérer
              </Button>
            </div>

            <div className="p-4 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-red-900">Supprimer mon compte</p>
                  <p className="text-sm text-red-700">
                    Cette action est irréversible
                  </p>
                </div>
                <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
