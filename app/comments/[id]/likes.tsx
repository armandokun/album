import { View, FlatList, Alert, SafeAreaView } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useEffect, useState } from 'react'
import { Image } from 'expo-image'

import { BlurView } from 'expo-blur'

import { supabase } from '@/libs/supabase'
import Text from '@/components/ui/Text'

type Profile = {
  id: string
  name: string | null
  avatar_url: string | null
}

const LikesScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [profiles, setProfiles] = useState<Array<Profile>>([])

  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('comments_likes')
        .select(
          `
          profiles (
            id,
            name,
            avatar_url
          )
        `,
        )
        .eq('comment_id', Number(id))

      if (error) {
        Alert.alert('Error fetching profiles', error.message)

        return
      }

      if (data) setProfiles(data.map((profile) => profile.profiles))
    }

    fetchProfiles()
  }, [id])

  const renderProfile = ({ item }: { item: Profile }) => (
    <View className="flex-row items-center gap-3 px-4 py-2">
      <Image
        source={{ uri: item.avatar_url }}
        style={{ width: 44, height: 44, borderRadius: 22 }}
        contentFit="cover"
      />
      <Text type="body">{item.name}</Text>
    </View>
  )

  return (
    <BlurView intensity={80} tint="systemChromeMaterialDark" className="flex-1">
      <SafeAreaView>
        <FlatList data={profiles} renderItem={renderProfile} keyExtractor={(item) => item.id} />
      </SafeAreaView>
    </BlurView>
  )
}

export default LikesScreen
