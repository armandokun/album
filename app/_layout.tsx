/* eslint-disable react/no-unstable-nested-components */
import { useFonts } from 'expo-font'
import { router, Stack, useNavigation } from 'expo-router'
import * as SplashScreen from 'expo-splash-screen'
import { StatusBar } from 'expo-status-bar'
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet'
import { GestureHandlerRootView, TouchableOpacity } from 'react-native-gesture-handler'
import { Ionicons } from '@expo/vector-icons'
import { useEffect } from 'react'
import * as Notifications from 'expo-notifications'

import { HOME } from '@/constants/routes'
import { Colors } from '@/constants/colors'
import SessionProvider from '@/container/SessionProvider'
import HeaderBackground from '@/components/HeaderBackground'

import '../global.css'

SplashScreen.preventAutoHideAsync()

const RootLayout = () => {
  const navigation = useNavigation()

  const [loaded] = useFonts({
    Geist: require('../assets/fonts/Geist-Regular.otf'),
    GeistMono: require('../assets/fonts/GeistMono-Regular.otf'),
  })

  useEffect(() => {
    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const postId = response.notification.request.content.data.post_id

      if (!postId) return

      setTimeout(() => {
        router.push(`/posts/${postId}`)
      }, 1000)
    })

    return () => subscription.remove()
  }, [])

  if (!loaded) return null

  const handleGoBack = () => {
    const canGoBack = navigation.canGoBack()

    if (!canGoBack) return router.replace(HOME)

    navigation.goBack()
  }

  return (
    <GestureHandlerRootView className="flex-1">
      <BottomSheetModalProvider>
        <SessionProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              headerTransparent: true,
              headerTintColor: Colors.text,
              headerBackground: HeaderBackground,
            }}>
            <Stack.Screen name="+not-found" />
            <Stack.Screen name="home" />
            <Stack.Screen
              name="new"
              options={{ presentation: 'modal', headerTitle: 'New Post', headerShown: true }}
            />
            <Stack.Screen name="index" />
            <Stack.Screen
              name="posts/[id]"
              options={{
                presentation: 'modal',
                headerTitle: '',
                headerShown: true,
                headerRight: () => (
                  <TouchableOpacity onPress={handleGoBack}>
                    <Ionicons name="close-circle" size={36} color={Colors.text} />
                  </TouchableOpacity>
                ),
              }}
            />
            <Stack.Screen
              name="comments/[id]/likes"
              options={{
                presentation: 'transparentModal',
                headerTitle: 'Likes',
                headerShown: true,
                headerRight: () => (
                  <TouchableOpacity onPress={handleGoBack}>
                    <Ionicons name="close-circle" size={36} color={Colors.text} />
                  </TouchableOpacity>
                ),
              }}
            />
          </Stack>
          <StatusBar style="light" />
        </SessionProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout
