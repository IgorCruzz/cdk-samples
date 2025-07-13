import axios from 'axios'

export const auth = {
  login: async (data: { email: string; password: string }) => {
    return await axios.post(
      "https://us-east-1vqukuu8e5.auth.us-east-1.amazoncognito.com/oauth2/token",
      new URLSearchParams({
        grant_type: "password",
        client_id: "5jt1ofjdv34b344lbiq1jj5av7",
        username: data.email,
        password: data.password,
    }),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
  }
}