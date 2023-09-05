import { PUBLIC_BACKEND_BASE_URL } from '$env/static/public';


const emptyAuth = {
	token: '',
	userId: '',
	refreshToken: ''
};

export async function logOut() {
	localStorage.setItem('auth', JSON.stringify(emptyAuth));
	return true;
}

export function getUserId() {
	const auth = localStorage.getItem('auth');
	if (auth) {
		return JSON.parse(auth)['userId'];
	}
	return null;
}

export function getTokenFromLocalStorage() {
	const auth = localStorage.getItem('auth');
	if (auth) {
		return JSON.parse(auth)['token'];
	}
	return null;
}

export function getRefreshTokenFromLocalStorage() {
	const auth = localStorage.getItem('auth');
	if (auth) {
		return JSON.parse(auth)['refreshToken'];
	}
	return null;
}

export async function isLoggedIn() {
	if (!getRefreshTokenFromLocalStorage()) {
		return false;
	}

	try {
		const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/refresh', {
			method: 'POST',
			mode: 'cors',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ refreshToken: getRefreshTokenFromLocalStorage() })
		});
		const res = await resp.json();
		if (resp.ok) {
			localStorage.setItem(
				'auth',
				JSON.stringify({
					token: res.token,
					userId: res.userId,
					refreshToken: res.refreshToken
				})
			);
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

// Lets say when users key in login credential (username & password), we authenticate it by posting it to backend and check
export async function authenticateUser(email, password) {
	const resp = await fetch(PUBLIC_BACKEND_BASE_URL + '/auth', {
		method: 'POST',
		mode: 'cors',
		headers: {
			'Content-Type': 'application/json'
		},
        // keys named identity and password are mentioned needed for this POST request
		body: JSON.stringify({
			email,
			password
		})
	});

    // If matched successfully, it return an object with keys "token" and "record"
	const res = await resp.json();

	// generate JWTs
	if (resp.ok) {
		localStorage.setItem(
			'auth',
			JSON.stringify({
				token: res.token,
				userId: res.userId,
				refreshToken: res.refreshToken
			})
		);

		return {
			success: true,
			res: res
		};
	}

    // if 
	return {
		success: false,
		res: res
	};
}