import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';

import styles from './styles';
import Ionicons from 'react-native-vector-icons/Ionicons';

type Props = {
  salonName: string;
  ownerName: string;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
};

export default function Header({
  salonName,
  ownerName,
  logoUrl,
  coverImageUrl,
}: Props) {
  const today = new Date();

  const formattedDate = today.toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  const renderHeaderContent = () => {
    return (
      <>
        {/* Header Top Row */}
        <View style={styles.headerTopRow}>
          {/* Salon Information */}
          <View style={styles.salonInfo}>
            {/* Salon Name */}
            <Text style={styles.salonName}>
              {salonName || 'Your Salon'}
            </Text>

            {/* Date */}
            <Text
              style={{
                color: '#000000',
                marginTop: 2,
                fontSize: 12,
              }}>
              {formattedDate}
            </Text>
          </View>

          {/* Notification */}
          <TouchableOpacity
            style={styles.notificationButton}
            activeOpacity={0.75}
            onPress={() => {
              // Open notifications
            }}>
            <Ionicons
              name="notifications"
              size={22}
              color="#1F2937"
            />

            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                3
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Profile / Salon Logo */}
        {/* {logoUrl ? (
          <Image
            source={{
              uri: logoUrl,
            }}
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              marginBottom: 12,
              borderWidth: 3,
              borderColor: '#FFFFFF',
            }}
            resizeMode="cover"
            onError={error => {
              console.log(
                '[DashboardHeader] Logo image failed:',
                error?.nativeEvent,
              );
              console.log(
                '[DashboardHeader] logoUrl:',
                logoUrl,
              );
            }}
          />
        ) : (
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              marginBottom: 12,
              borderWidth: 3,
              borderColor: '#FFFFFF',
              backgroundColor: '#FFFFFF',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Text
              style={{
                fontSize: 28,
                fontWeight: '700',
                color: '#555',
              }}>
              {(salonName || 'S')
                .charAt(0)
                .toUpperCase()}
            </Text>
          </View>
        )} */}

        {/* Salon Name */}
        {/* <Text style={styles.salonName}>
          {salonName || 'Your Salon'}
        </Text> */}

        {/* Owner Name */}
        {/* <Text
          style={{
            color: '#FFFFFF',
            marginTop: 4,
            fontSize: 15,
            fontWeight: '500',
          }}>
          {ownerName || 'Owner'}
        </Text> */}

        {/* Date */}
        {/* <Text
          style={{
            color: '#000000',
            marginTop: 2,
            fontSize: 12,
          }}>
          {formattedDate}
        </Text> */}
      </>
    );
  };

  /*
   * If a cover photo exists, use it as the
   * complete dashboard header background.
   */
  // if (coverImageUrl) {
  //   return (
  //     <ImageBackground
  //       source={{
  //         uri: coverImageUrl,
  //       }}
  //       style={styles.header}
  //       imageStyle={{
  //         borderBottomLeftRadius: 24,
  //         borderBottomRightRadius: 24,
  //       }}
  //       resizeMode="cover"
  //       onError={error => {
  //         console.log(
  //           '[DashboardHeader] Cover image failed:',
  //           error?.nativeEvent,
  //         );
  //         console.log(
  //           '[DashboardHeader] coverImageUrl:',
  //           coverImageUrl,
  //         );
  //       }}>
  //       {/* Dark overlay so text remains readable */}
  //       <View
  //         style={{
  //           flex: 1,
  //           width: '100%',
  //           backgroundColor: 'rgba(0, 0, 0, 0.40)',
  //           alignItems: 'center',
  //           justifyContent: 'center',
  //           paddingVertical: 25,
  //           borderBottomLeftRadius: 24,
  //           borderBottomRightRadius: 24,
  //         }}>
  //         {renderHeaderContent()}
  //       </View>
  //     </ImageBackground>
  //   );
  // }

  /*
   * Fallback when no cover photo exists.
   * Keeps the existing header styling.
   */
  return (
    <View style={styles.header}>
      {renderHeaderContent()}
    </View>
  );
}