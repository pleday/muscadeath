/**
 * Admin access configuration.
 *
 * IMPORTANT SECURITY NOTE: this site is a fully static frontend (no server,
 * no database). This password check only happens in the visitor's browser,
 * so it is a deterrent against casual visitors finding the admin page, NOT
 * real authentication -- the hash below is shipped in the JS bundle and
 * could be brute-forced offline. Do not use it to protect sensitive data,
 * and pick a long, unique password.
 *
 * Default password: "muscadeath2027"
 *
 * To change it:
 * 1. Open your browser's developer console on any page and run:
 *      crypto.subtle.digest('SHA-256', new TextEncoder().encode('your-new-password'))
 *        .then(b => console.log(Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join('')))
 * 2. Copy the printed hash below.
 */
export const ADMIN_PASSWORD_HASH =
  'b62077957e238c7b5263f7b03c8bc27e217ca0313eabecba809c003d89ccc754'
