import { NavigatorScreenParams } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  ProfileSetup: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  Profile: undefined;
  Prompt: { question: string };
  FamilyConnections: undefined;
  AddFamilyMember: undefined;
  JoinFamily: undefined;
};

// Auth Stack
export type AuthStackParamList = {
  Onboarding: undefined;
  RoleSelection: { mode: 'signup' | 'login' };
  Signup: { userType: 'student' | 'parent' };
  Login: { userType: 'student' | 'parent' };
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  CheckIn: undefined;
  Timeline: undefined;
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> =
  CompositeScreenProps<
    NativeStackScreenProps<AuthStackParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<RootStackParamList>
  >;
