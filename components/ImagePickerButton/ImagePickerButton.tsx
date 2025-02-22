import { Alert, Platform, TouchableOpacity, View } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { decode } from 'base64-arraybuffer'
import * as FileSystem from 'expo-file-system'
import { router } from 'expo-router'
import { useState } from 'react'
import { faker } from '@faker-js/faker'
import * as ImageManipulator from 'expo-image-manipulator'

import { supabase } from '@/libs/supabase'
import { NEW_POST } from '@/constants/routes'
import { Colors } from '@/constants/colors'

import ContextMenu from '../ui/ContextMenu'
import FullScreenLoader from '../FullScreenLoader'
import Text from '../ui/Text'

type Props = {
  buttonType?: 'icon' | 'button'
}

const ImagePickerButton = ({ buttonType = 'icon' }: Props) => {
  const [isLoading, setIsLoading] = useState(false)

  const pickOrCapturePhoto = async (type: 'camera' | 'gallery') => {
    let result: ImagePicker.ImagePickerResult

    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync()

      if (status !== ImagePicker.PermissionStatus.GRANTED) {
        Alert.alert('Permission not granted', 'Please grant permission to access the camera')
        return
      }

      result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        selectionLimit: 1,
      })
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        selectionLimit: 1,
      })
    }

    setIsLoading(true)

    try {
      if (!result.canceled) {
        const file = result.assets[0]
        const fileName = `${Date.now()}-${file.fileName}`

        const manipulatedImage = await ImageManipulator.manipulateAsync(
          file.uri,
          [{ resize: { width: 1080 } }],
          {
            compress: 0.8,
            format: ImageManipulator.SaveFormat.JPEG,
          },
        )

        const base64Data = await FileSystem.readAsStringAsync(manipulatedImage.uri, {
          encoding: FileSystem.EncodingType.Base64,
        })

        const { error: uploadError } = await supabase.storage
          .from('user_content')
          .upload(fileName, decode(base64Data), {
            contentType: file.mimeType,
            cacheControl: '3600',
            upsert: true,
          })

        if (uploadError) {
          Alert.alert('Error uploading image', uploadError?.message)

          setIsLoading(false)

          return
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from('user_content').getPublicUrl(fileName)

        setIsLoading(false)

        if (publicUrl) {
          router.push({
            pathname: NEW_POST,
            params: {
              imageUrl: publicUrl,
            },
          })
        }
      }
    } catch (error) {
      Alert.alert('Error picking image', error instanceof Error ? error.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleContextMenuPress = (id: string) => {
    switch (id) {
      case 'camera':
        pickOrCapturePhoto('camera')
        break
      case 'gallery':
        pickOrCapturePhoto('gallery')
        break
    }
  }

  return (
    <>
      <TouchableOpacity>
        <ContextMenu
          itemId={Number(faker.string.uuid())}
          actions={[
            {
              id: 'camera',
              title: 'Take a photo',
              image: Platform.select({
                ios: 'camera',
                android: 'ic_menu_camera',
              }),
              imageColor: Colors.text,
            },
            {
              id: 'gallery',
              title: 'Choose from gallery',
              image: Platform.select({
                ios: 'photo',
                android: 'ic_menu_gallery',
              }),
              imageColor: Colors.text,
            },
          ]}
          onPress={handleContextMenuPress}
          shouldOpenOnLongPress={false}>
          {buttonType === 'icon' ? (
            <Ionicons name="add-circle" size={40} color="white" />
          ) : (
            <View className="px-4 py-1 bg-text rounded-full mt-2">
              <Text type="button" style={{ color: Colors.background }}>
                Add Post
              </Text>
            </View>
          )}
        </ContextMenu>
      </TouchableOpacity>
      <FullScreenLoader show={isLoading} title="Loading..." />
    </>
  )
}

export default ImagePickerButton
