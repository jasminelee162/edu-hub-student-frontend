import axios from 'axios'
import store from '@/store'
import { Message, MessageBox } from 'element-ui'  //导入element-ui组件库
 
// 创建axios的对象
const instance = axios.create({
    baseURL: "http://localhost:8080",  //配置固定域名
    timeout: 50000
})
 
// 请求拦截
// 所有的网络请求都会走这个方法,可以在请求添加自定义内容
instance.interceptors.request.use(
    function (config) {
        if (config.method === 'post') {
            config.data = {
              ...config.data,
              _t: Date.parse(new Date()) / 1000 // 时间戳
            }
        } else if (config.method === 'get') {
            config.params = {
              random: Math.random(), // 随机数
              ...config.params
            }
        }
        config.headers.x_access_token = window.localStorage.getItem("user_token") // 请求头添加token值
        return config
    },
    function (err) {
        return Promise.request(err)
    }
)
 
// 响应拦截
// 此处可以根据服务器返回的状态码做相应的数据
instance.interceptors.response.use(
    function (response) {
        const res = response
        console.log("响应状态码：", res.status)
        console.log("响应数据结构：", res)
        if (res.data.code === 1011 || res.data.code == 1008 || res.data.code == 1006) {
            MessageBox.alert('系统登录已过期，请重新登录', '错误', {
                confirmButtonText: '确定',
                type: 'error'
            }).then(() => {
                store.dispatch('logout').then(() => {
                    window.localStorage.removeItem("user_token")
                    location.reload()
                })
            })
            return Promise.reject('error')
        } else if(res.data.code == 1009) {
            MessageBox.alert('该账号已被锁定', '错误', {
                confirmButtonText: '确定',
                type: 'error'
            }).then(() => {
                store.dispatch('logout').then(() => {
                    window.localStorage.removeItem("user_token")
                    location.reload()
                })
            })
            return Promise.reject('error')
        } else if (res.status != 200) {
            MessageBox.alert('系统内部错误，请联系管理员维护', '错误', {
                confirmButtonText: '确定',
                type: 'error'
            })
            return Promise.reject('error')
        } else {
            return res.data
        }
    },
    function (err) {
        MessageBox.alert('系统内部错误，请联系管理员维护', '错误', {
            confirmButtonText: '确定',
            type: 'error'
        })
        return Promise.reject('error')
    }
)
 
// 封装get和post请求
export function get(url, params) {
    return instance.get(url, {params})
}
 
export function post(url, data) {
    return instance.post(url, data)
}
 
export default instance;