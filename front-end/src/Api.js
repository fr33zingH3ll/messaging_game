export const Login = async(email, password) => {
    const result = await request("/auth/login", {
		body: JSON.stringify({ email, password }),
		method: "POST",
	});

	const body = await result.json();

	if (!result.ok) {
		throw new Error(body.error);
	}

	const token = body.token;
	localStorage.setItem("token", token);
}

const request = async (url, parameters) => {
	return await fetch("/api/v1" + url, {
		headers: {
			Accept: "application/json",
			"Content-Type": "application/json",
			...(localStorage.getItem("token") ? { Authorization: "Bearer " + localStorage.getItem("token") } : {})
		}, ...(parameters ? parameters : {})
	});
};