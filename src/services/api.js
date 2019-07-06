import axios from 'axios'

const HTTP_TYPE = {
  GET: 0,
  POST: 1,
  PUT: 2,
  DELETE: 3,
  UPLOAD: 4
}

const spliceApiUrl = (apiUrl, params) => {
  let url = '?'
  for (const key in params) {
    if (params.hasOwnProperty(key)) {
      url += key + '=' + params[key] + '&'
    }
  }
  url = url.substring(0, url.length - 1)
  return apiUrl + url
}

const apiService = (type, url, params, progress) => {
  return new Promise((resolve, reject) => {
    switch (type) {
      case HTTP_TYPE.GET:
        axios
          .get(spliceApiUrl(url, params))
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error.response)
          })
        break
      case HTTP_TYPE.POST:
        axios
          .post(url, params)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error.response)
          })
        break
      case HTTP_TYPE.PUT:
        axios
          .put(url, params)
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error.response)
          })
        break
      case HTTP_TYPE.DELETE:
        axios
          .delete(spliceApiUrl(url, params))
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error.response)
          })
        break
      case HTTP_TYPE.UPLOAD:
        axios.defaults.headers.common['Content-Type'] = 'multipart/form-data'
        axios({
          url: url,
          method: 'post',
          onUploadProgress: progressEvent => {
            if (progress) {
              progress(
                Math.floor((progressEvent.loaded / progressEvent.total) * 100)
              )
            }
          },
          data: params
        })
          .then(result => {
            resolve(result)
          })
          .catch(error => {
            reject(error.response)
          })
        break
    }
  })
}

export { apiService, HTTP_TYPE }
