/* eslint-disable react/no-unstable-nested-components */
import { BlurView } from 'expo-blur'
import { Alert, StyleSheet, KeyboardAvoidingView } from 'react-native'
import { router, useLocalSearchParams, useNavigation } from 'expo-router'
import React, { useCallback, useEffect, useState } from 'react'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'

import { supabase } from '@/libs/supabase'
import { Colors } from '@/constants/colors'
import { HOME } from '@/constants/routes'

import TextArea from '@/components/ui/TextArea'
import Spacer from '@/components/ui/Spacer'
import Button from '@/components/ui/Button'
import KeyboardDismissPressable from '@/components/ui/KeyboardDismissPressable'
import FullScreenLoader from '@/components/FullScreenLoader'

const NewScreen = () => {
  const [description, setDescription] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  const { imageUrl } = useLocalSearchParams()
  const navigation = useNavigation()

  const uploadPost = useCallback(async () => {
    setIsUploading(true)

    const { error } = await supabase.from('posts').insert({
      image_url: imageUrl,
      description,
    })

    if (error) Alert.alert('Error uploading image', error.message)

    setIsUploading(false)

    router.replace(HOME)
  }, [description, imageUrl])

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => <Button title="Post" onPress={uploadPost} />,
      headerLeft: () => <Button title="Cancel" type="flat" onPress={() => navigation.goBack()} />,
      headerBackground: () => (
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.8)', 'transparent']}
          style={StyleSheet.absoluteFill}
        />
      ),
    })
  }, [navigation, uploadPost])

  return (
    <>
      <Image
        key={imageUrl.toString()}
        source={{ uri: imageUrl.toString() }}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
      />
      <BlurView
        intensity={80}
        tint="systemChromeMaterialDark"
        style={StyleSheet.absoluteFill}
        className="absolute w-full h-full"
      />
      <KeyboardDismissPressable>
        <KeyboardAvoidingView
          behavior="padding"
          keyboardVerticalOffset={100}
          className="flex-1 mx-4 justify-center">
          <Image
            source={{ uri: imageUrl.toString() }}
            contentFit="cover"
            style={{
              aspectRatio: 1,
              borderRadius: 32,
            }}
          />
          <Spacer />
          <TextArea
            value={description}
            onChangeText={setDescription}
            placeholder="What's on your mind?"
            style={{ fontSize: 22, color: Colors.text }}
            placeholderTextColor="rgba(255, 255, 255, 0.6)"
            className="h-[100px]"
          />
        </KeyboardAvoidingView>
      </KeyboardDismissPressable>
      <FullScreenLoader show={isUploading} title="Posting..." />
    </>
  )
}

export default NewScreen
