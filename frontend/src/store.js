import create from 'zustand'

const useAuth = create((set) => ({
	token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
	user: typeof window !== 'undefined' && localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null,
	setAuth: (token, user) => {
		localStorage.setItem('token', token)
		localStorage.setItem('user', JSON.stringify(user))
		set({ token, user })
	},
	logout: () => {
		localStorage.removeItem('token')
		localStorage.removeItem('user')
		set({ token: null, user: null })
	}
}))

export default useAuth
