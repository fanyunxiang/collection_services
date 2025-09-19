import axios, {
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios'

const baseURL = process.env.NEXT_PUBLIC_API_BASE || '/api'

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000,
})

// request interceptor
axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers?.set?.('Authorization', `Bearer ${token}`)
    }
  }
  return config
})

// response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    console.error(error)
    return Promise.reject(error)
  }
)

export async function doRequest<T = any>(
  url: string,
  method: 'get' | 'post' | 'put' | 'delete',
  data?: object,
  config?: AxiosRequestConfig
): Promise<T> {
  const conf: AxiosRequestConfig = {
    method,
    url,
    ...config,
  }

  if (method === 'get') {
    conf.params = data
  } else {
    conf.data = data
  }

  const res = await axiosInstance.request<T>(conf)
  return res as T
}

export const get = <T = any>(url: string, params?: object, config?: AxiosRequestConfig) =>
  doRequest<T>(url, 'get', params, config)

export const post = <T = any>(url: string, body?: object, config?: AxiosRequestConfig) =>
  doRequest<T>(url, 'post', body, config)

export const put = <T = any>(url: string, body?: object, config?: AxiosRequestConfig) =>
  doRequest<T>(url, 'put', body, config)

export const del = <T = any>(url: string, params?: object, config?: AxiosRequestConfig) =>
  doRequest<T>(url, 'delete', params, config)

export const postForm = <T = any>(url: string, body?: object, config?: AxiosRequestConfig) =>
  doRequest<T>(url, 'post', body, {
    ...config,
    headers: {
      ...(config?.headers || {}),
      'Content-Type': 'multipart/form-data',
    },
  })

export default axiosInstance
