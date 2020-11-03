// external
import fetch from 'cross-fetch'

// github
import { getHeaders, GitHubCredentials } from 'githubauthreq'
import { env } from 'process'
const { GITHUB_API = 'https://api.github.com' } = env

/** Have the request fail with the details as to why */
function fail(slug: string, details: object) {
	return Promise.reject(
		new Error(
			`failed to fetch the latest commit for ${slug}\n${JSON.stringify(
				details,
				null,
				'  '
			)}`
		)
	)
}

/**
 * Get the latest commit for a github repository
 * @param slug the organisation/user name along with the repository name, e.g. `bevry/github-commit`
 * @param credentials the github credentials you wish to use, otherwise it uses those within the env vars
 * @returns the latest github commit
 */
export default async function getLatestCommit(
	slug: string,
	credentials?: GitHubCredentials
): Promise<string> {
	// prepare the request metadata
	const url = `${GITHUB_API}/repos/${slug}/commits`
	const headers = getHeaders(credentials)
	const init = {
		headers: {
			...headers,
			'User-Agent': '@bevry/github-commit',
		},
	}
	// fetch url
	let response: Response
	try {
		response = await fetch(url, init)
	} catch (err) {
		return fail(slug, {
			url,
			message: err,
		})
	}
	// failed with error message
	if (response.status < 200 || response.status >= 300) {
		return fail(slug, {
			url,
			status: response.status,
			message: await response.text(),
		})
	}
	// parse result
	const result = await response.json()
	// failed with json error message
	if (result.message) {
		return fail(slug, {
			url,
			message: result.message,
		})
	}
	// unexpected result
	const commit = result[0] && result[0].sha
	if (!commit) {
		return fail(slug, {
			url,
			message: 'result was unexpected',
			result,
		})
	}
	// success
	return commit
}
