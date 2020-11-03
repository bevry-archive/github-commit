import { equal, errorEqual } from 'assert-helpers'
import kava from 'kava'

import getCommit from './index.js'

kava.suite('github-commit', function (suite, test) {
	test('fails on empty', function (done) {
		getCommit('bevry-archive/empty')
			.then(() => done(new Error('empty repo should not have passed')))
			.catch(() => {
				done()
			})
	})
	test('success case works as expected', function (done) {
		getCommit('bevry-archive/echo')
			.then((commit) => {
				console.log({ commit })
				equal(typeof commit, 'string', 'commit is a string')
				equal(commit.length > 1, true, 'commit has a length')
				done()
			})
			.catch(done)
	})
})
