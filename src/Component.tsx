import React, {useEffect, useRef} from 'react';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Share from 'react-native-share';
import ViewShot, {captureRef} from 'react-native-view-shot';
import {
  Pressable,
  Platform,
  Modal,
  useWindowDimensions,
  View,
  ActivityIndicator,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import axios from 'axios';
import ImageResizer from 'react-native-image-resizer';
import {Toast} from 'react-native-toast-message/lib/src/Toast';

interface ButtonType {
  children: React.ReactNode;
  type?: 'primary' | 'secondary' | 'gray';
  onPress?: () => void;
  disabled?: boolean;
}

export const ButtonContainer = styled.TouchableOpacity<{
  color: string;
  disabled?: boolean;
}>`
  background-color: ${props =>
    props.disabled ? props.theme.gray4 : props.theme[props.color]};
  padding: 8px;
  width: 100%;
  align-items: center;
  border-radius: 10px;
`;

interface FontType {
  size: number;
  weight?: 'Bold' | 'Medium' | 'Regular';
  color?: string;
  lineHeight?: number;
  textAlign?: 'center';
  border?: boolean;
}

export const NotoSansKR = styled.Text<FontType>`
  color: ${({color, theme}) => (color ? theme[color] : theme.black)};
  /* 안드로이드에서 font 오류 */
  /* font-family: ${({weight}) => `NotoSansKR-${weight || 'Bold'}`}; */
  line-height: ${({lineHeight, size}) =>
    lineHeight ? lineHeight + 'px' : size * 1.75 + 'px'};
  font-size: ${({size}) => size + 'px'};
  text-align: ${({textAlign}) => (textAlign ? textAlign : 'auto')};
`;

export const InputNotoSansKR = styled.TextInput<FontType>`
  color: ${({color, theme}) => (color ? theme[color] : theme.black)};
  /* 안드로이드에서 font 오류 */
  /* font-family: ${({weight}) => `NotoSansKR-${weight || 'Bold'}`}; */
  line-height: ${({lineHeight, size}) =>
    lineHeight ? `${lineHeight}px` : `${size * 1.45}px`};
  font-size: ${({size}) => `${size}px`};
  padding: 0;
  padding-bottom: 4px;
  margin: 0;
  border-bottom-width: ${({border}) => (border ? '1px' : 0)};
`;

export const TossFace = styled.Text<{size: number}>`
  font-size: ${({size}) => size + 'px'};
  line-height: ${({size}) => size * 2 + 'px'};
  font-family: 'TossFaceFontMac';
`;

export const InnerContainer = styled.View<{gap?: number; seperate?: boolean}>`
  flex: 1;
  padding: 16px;
  text-align: left;
  justify-content: ${props =>
    props.seperate ? 'space-between' : 'flex-start'};
`;

export const HomeContainer = styled.SafeAreaView<{color?: string}>`
  position: relative;
  flex: 1;
  background-color: ${({color, theme}) => (color ? theme[color] : theme.white)};
`;

export const ScrollContainer = styled.ScrollView.attrs({
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
})`
  flex: 1;
`;

const RowScrollView = styled.View`
  flex-direction: row;
  padding: 0 16px;
`;

interface ScrollContainerType {
  children: React.ReactNode;
  gap?: number;
}

export const RowScrollContainer = ({children, gap}: ScrollContainerType) => {
  return (
    <ScrollContainer horizontal style={{marginLeft: -16, marginRight: -16}}>
      <RowScrollView style={{gap: gap}}>{children}</RowScrollView>
    </ScrollContainer>
  );
};

export const ButtonComponent = ({
  children,
  type,
  onPress,
  disabled,
}: ButtonType) => {
  let color = 'white';
  let backgroundColor = 'primary1';

  if (type === 'secondary') {
    color = 'gray4';
    backgroundColor = 'white';
  } else if (type === 'gray') {
    color = 'gray4';
    backgroundColor = 'gray7';
  }

  if (disabled) {
    color = 'white';
    backgroundColor = 'gray4';
  }

  return (
    <ButtonContainer
      color={backgroundColor}
      onPress={onPress}
      disabled={disabled}>
      <NotoSansKR color={color} size={16} lineHeight={23}>
        {children}
      </NotoSansKR>
    </ButtonContainer>
  );
};

export const RowContainer = styled.View<{gap?: number; seperate?: boolean}>`
  flex-direction: row;
  align-items: center;
  justify-content: ${props =>
    props.seperate ? 'space-between' : 'flex-start'};
`;

interface API {
  endpoint: string;
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  accessToken?: string;
  body?: object;
  formData?: boolean;
}

interface Config {
  method: 'GET' | 'POST' | 'DELETE' | 'PUT';
  url: string;
  headers: {
    'Content-Type'?: string;
    Authorization?: string;
  };
  data?: object | FormData;
}

export const useApi = () => {
  const navigation = useNavigation();

  async function CallApi({endpoint, method, accessToken, body, formData}: API) {
    let baseUrl = 'https://dorun.site';

    baseUrl =
      Platform.OS === 'android'
        ? 'http://10.0.2.2:8000'
        : 'http://127.0.0.1:8000';

    const url = `${baseUrl}/${endpoint}`;

    try {
      const axiosConfig: Config = {
        method: method,
        url: url,
        headers: {
          Authorization: accessToken ? `Bearer ${accessToken}` : '',
        },
        data: body,
      };

      if (formData) {
        axiosConfig.headers['Content-Type'] = 'multipart/form-data';
      }

      const response = await axios(axiosConfig);

      if (response.status !== 200) {
        if (response.data?.detail === '토큰이 만료되었습니다.') {
          navigation.navigate('LoginTab' as never);
        }

        throw new Error(
          `API call failed: ${response.status}, Details: ${response.statusText}`,
        );
      }

      console.log(response.data);

      return response.data;
    } catch (error) {
      // 오류 로깅 개선
      if (axios.isAxiosError(error)) {
        console.error('Axios Error:', error.response?.data || error.message);
      } else {
        console.error('Non-Axios error:', error);
      }

      if (navigation.canGoBack()) {
        Toast.show({
          type: 'error',
          text1: '올바르지 않은 접근입니다',
        });
        navigation.goBack();
      }

      throw error;
    }
  }

  return CallApi;
};

const ViewImageModalBackground = styled.TouchableOpacity`
  background-color: 'rgba(0,0,0,0.6)';
  justify-content: center;
  align-items: center;
`;

export const ModalViewPhoto = ({visible, onClose, res}: any) => {
  const width = useWindowDimensions().width;
  const height = useWindowDimensions().height;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <ViewImageModalBackground onPress={onClose}>
        <ViewImageStyles
          source={{uri: res?.uri}}
          width={width}
          height={height}
          resizeMode="contain"
        />
      </ViewImageModalBackground>
    </Modal>
  );
};

const ViewImageStyles = styled.Image<{height: any}>`
  width: ${props => props.height};
`;

export const ContentSave = ({children}: {children: React.ReactNode}) => {
  const ref = useRef<ViewShot | null>(null);

  useEffect(() => {
    // on mount
    if (ref.current) {
      captureRef(ref, {
        format: 'jpg',
        quality: 0.9,
      }).then((uri: string) => {
        console.log('do something with ', uri);
      });
    }
  }, []);

  const onShare = async () => {
    try {
      console.log('click');

      const uri = await captureRef(ref, {
        format: 'jpg',
        quality: 0.9,
      });

      let options = {
        title: 'Share via',
        message: 'Check out this image!',
        url: Platform.OS === 'ios' ? `file://${uri}` : uri,
      };
      await Share.open(options);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  return (
    <>
      <Pressable
        // 클릭하면 viewRef를 이미지 파일로 변환해서 저장해 줌
        onPress={onShare}
        style={{padding: 10}}>
        <Icon name="share" size={18} color={'#000'} />
      </Pressable>
      <ViewShot
        ref={ref}
        options={{fileName: 'myContext', format: 'jpg', quality: 0.9}}>
        {children}
      </ViewShot>
    </>
  );
};
export const GetImage = (fileName: string) => {
  return `https://do-run.s3.amazonaws.com/${fileName}`;
};
export function convertKoKRToUTC(dateString: string) {
  const localDate = new Date(dateString); // 한국 시간대 GMT+9

  // UTC Date 객체 생성
  const utcDate = new Date(
    localDate.getUTCFullYear(),
    localDate.getUTCMonth(),
    localDate.getUTCDate(),
    localDate.getUTCHours(),
    localDate.getUTCMinutes(),
    localDate.getUTCSeconds(),
  );

  return utcDate;
}

export function convertUTCToKoKRDay(dateString: string) {
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  const utcDate = new Date(dateString);

  // 한국 시간대로 변환 (UTC+9)
  const koreaTimeOffset = 9 * 60; // 9시간을 분 단위로 변환
  const localTime = new Date(utcDate.getTime() + koreaTimeOffset * 60000); // 밀리초 단위로 변환하여 더함

  // YYYY-MM-DD 형식으로 변환
  const year = localTime.getFullYear();
  const month = (localTime.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
  const day = localTime.getDate().toString().padStart(2, '0');
  const weekDay = weekDays[localTime.getDay()]; // 요일명 추출

  return `${year}-${month}-${day} (${weekDay})`;
}

export function convertUTCToKoKR(dateString: string) {
  const utcDate = new Date(dateString);

  // 한국 시간대로 변환 (UTC+9)
  const koreaTimeOffset = 9 * 60; // 9시간을 분 단위로 변환
  const localTime = new Date(utcDate.getTime() + koreaTimeOffset * 60000); // 밀리초 단위로 변환하여 더함

  // YYYY-MM-DD 형식으로 변환
  const year = localTime.getFullYear();
  const month = (localTime.getMonth() + 1).toString().padStart(2, '0'); // 월은 0부터 시작하므로 1을 더함
  const day = localTime.getDate().toString().padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export const calculateDaysUntil = (startDateString: string) => {
  const startDate = new Date(startDateString);
  const currentDate = new Date(Date.now());

  const timeDifference = startDate.getTime() - currentDate.getTime();
  const daysUntil = Math.ceil(timeDifference / (1000 * 3600 * 24));

  return daysUntil;
};

export const calculateRemainTime = (endDtString: string) => {
  // 현재 UTC 시간
  const currentDateTimeUtc = new Date();
  // 종료 UTC 시간
  const endDateTimeUtc = new Date(`${endDtString}Z`);

  let timeDifference = endDateTimeUtc.getTime() - currentDateTimeUtc.getTime();

  // 차이가 음수인 경우, 0으로 설정
  if (timeDifference < 0) {
    timeDifference = 0;
  }

  // 밀리초를 시간과 분으로 변환
  const hours = Math.floor(timeDifference / (1000 * 60 * 60));
  const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

  // 시간과 분을 문자열로 포매팅
  const formattedHours = hours.toString().padStart(2, '0');
  const formattedMinutes = minutes.toString().padStart(2, '0');

  return `${formattedHours}:${formattedMinutes}`;
};

export const timeSince = (utcDate: string) => {
  const now = new Date();
  const past = new Date(`${utcDate}Z`);

  const msPerMinute = 60 * 1000;
  const msPerHour = msPerMinute * 60;

  const elapsed = now.getTime() - past.getTime();

  if (elapsed < msPerHour) {
    return Math.round(elapsed / msPerMinute) + '분 전';
  } else {
    return Math.round(elapsed / msPerHour) + '시간 전';
  }
};

export const LoadingIndicatior = () => (
  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
    <ActivityIndicator size="large" color="#0000ff" />
  </View>
);

export const resizeImage = async (uri: string | undefined) => {
  if (!uri) {
    console.error('Error: URI is undefined');
    return null;
  }

  try {
    const resizedImage = await ImageResizer.createResizedImage(
      uri,
      800,
      600,
      'JPEG',
      80,
    );
    return resizedImage;
  } catch (error) {
    console.error('Error resizing image: ', error);
    return null;
  }
};
