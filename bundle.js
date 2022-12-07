"use strict";Object.defineProperty(exports,"__esModule",{value:!0});var e=require("react"),r=require("crypto-js"),t=require("jwt-decode");function o(e){return e&&"object"==typeof e&&"default"in e?e:{default:e}}var s=o(e),n=o(t);const a=process.env.KINDE_SITE_URL,i=process.env.KINDE_ISSUER_URL,c=process.env.KINDE_POST_LOGOUT_REDIRECT_URL,u={initialState:{user:null,isLoading:!0,checkSession:null},SESSION_PREFIX:"pkce-verifier",redirectURL:a,issuerURL:i,clientID:process.env.KINDE_CLIENT_ID,clientSecret:process.env.KINDE_CLIENT_SECRET,postLogoutRedirectURL:c,audience:process.env.KINDE_AUDIENCE,responseType:"code",scope:"openid profile email offline",codeChallengeMethod:"S256",redirectRoutes:{callback:"/api/auth/kinde_callback"},issuerRoutes:{logout:"/logout",login:"/oauth2/auth",register:"/oauth2/auth",token:"/oauth2/token",profile:"/oauth2/v2/user_profile"}},d=()=>{throw new Error("Oops! Seems like you forgot to wrap your app in <KindeProvider>.")},l=e.createContext({...u.initialState,user:d,isLoading:d}),_=require("crypto"),g=()=>_.randomBytes(28).toString("hex");function h(){const e=g(),t=function(e){return r.SHA256(e).toString(r.enc.Base64url)}(e);return{code_verifier:e,code_challenge:t}}var p=require("cookie");const k=(e,r,t)=>{const o=g(),{code_challenge:s,code_verifier:n}=h();return r.setHeader("Set-Cookie",p.serialize(`${u.SESSION_PREFIX}-${o}`,n,{httpOnly:!0,maxAge:t})),{state:o,code_challenge:s}};var R=require("cookie");var y=require("cookie");var f=require("cookie");const L=(e,r)=>{if(e.cookies.kinde_token){return n.default(JSON.parse(e.cookies.kinde_token).access_token)}return{message:"There is no kinde_token, you are not authenticated. Try logging in."}},S=(e,r)=>{if(e.cookies.kinde_token){return n.default(JSON.parse(e.cookies.kinde_token).id_token)}return{message:"There is no kinde_token, you are not authenticated. Try logging in."}},m=(e,r,t)=>{const o=L(e);return o?o[t]:null};exports.KindeProvider=({children:r})=>{const[t,o]=e.useState({...u.initialState}),n="/api/auth/me",a=e.useCallback((async()=>{try{const e=await(async e=>{let r;try{r=await fetch(e)}catch{throw new RequestError(0)}if(r.ok)return r.json();r.status})(n);o((r=>({...r,user:e,error:void 0})))}catch(e){o((r=>({...r,isLoading:!1,error:e})))}}),[n]);e.useEffect((()=>{t.user||(async()=>{await a(),o((e=>({...e,isLoading:!1})))})()}),[t.user]);const{user:i,error:c,isLoading:d}=t;return s.default.createElement(l.Provider,{value:{user:i,error:c,isLoading:d,isAuthenticated:!!i}},r)},exports.getAccessToken=L,exports.getIdToken=S,exports.getOrganization=(e,r)=>({orgCode:m(e,0,"org_code")}),exports.getPermission=(e,r,t)=>{const o=m(e,0,"org_code");return{isGranted:(m(e,0,"permissions")||[]).some((e=>e===t)),orgCode:o}},exports.getPermissions=(e,r)=>{const t=m(e,0,"org_code");return{permissions:m(e,0,"permissions"),orgCode:t}},exports.getUserOrganizations=(e,r)=>{const t=((e,r,t)=>{const o=S(e);return o?o[t]:null})(e,0,"org_codes");return{orgCodes:t}},exports.handleAuth=()=>async function(e,r){let{query:{kindeAuth:t}}=e;switch(t=Array.isArray(t)?t[0]:t,t){case"login":return await(async(e,r)=>{const t=e.query,{org_code:o,is_create_org:s,org_name:n=""}=t,{state:a,code_challenge:i}=k(0,r,60),c=new URL(u.issuerURL+u.issuerRoutes.login);let d={redirect_uri:u.redirectURL+u.redirectRoutes.callback,client_id:u.clientID,response_type:u.responseType,scope:u.scope,code_challenge:i,code_challenge_method:u.codeChallengeMethod,state:a,start_page:"login"};o&&(d.org_code=o),s&&(d.is_create_org=s,d.org_name=n),u.audience&&(d.audience=u.audience),c.search=new URLSearchParams(d),r.redirect(c.href)})(e,r);case"register":return await(async(e,r)=>{const t=e.query,{org_code:o,is_create_org:s,org_name:n=""}=t,{state:a,code_challenge:i}=k(0,r,180),c=new URL(u.issuerURL+u.issuerRoutes.register);let d={redirect_uri:u.redirectURL+u.redirectRoutes.callback,client_id:u.clientID,response_type:u.responseType,scope:u.scope,code_challenge:i,code_challenge_method:u.codeChallengeMethod,state:a,start_page:"registration"};o&&(d.org_code=o),s&&(d.is_create_org=s,d.org_name=n),u.audience&&(d.audience=u.audience),c.search=new URLSearchParams(d),r.redirect(c.href)})(e,r);case"me":return await(async(e,r)=>{const t=y.parse(e.headers.cookie||"").kinde_token;if(t){const e=JSON.parse(t);try{const t=await fetch(u.issuerURL+u.issuerRoutes.profile,{headers:new Headers({Authorization:"Bearer "+e.access_token})}),o=await t.json();r.send(o)}catch(e){console.log(e)}}else r.status(401).send({message:"Unauthorized"})})(e,r);case"logout":return await(async(e,r)=>{r.setHeader("Set-Cookie",R.serialize("kinde_token",null,{httpOnly:!0,expires:new Date(0),sameSite:"lax",path:"/"}));const t=new URL(u.issuerURL+u.issuerRoutes.logout);t.searchParams.set("redirect",u.postLogoutRedirectURL),r.redirect(t.href)})(0,r);case"kinde_callback":return await(async(e,r)=>{const{code:t,state:o}=e.query,s=f.parse(e.headers.cookie||"")[`${u.SESSION_PREFIX}-${o}`];if(s){try{const e=await fetch(u.issuerURL+u.issuerRoutes.token,{method:"POST",headers:new Headers({"Content-type":"application/x-www-form-urlencoded; charset=UTF-8"}),body:new URLSearchParams({client_id:u.clientID,client_secret:u.clientSecret,code:t,code_verifier:s,grant_type:"authorization_code",redirect_uri:u.redirectURL+u.redirectRoutes.callback})}),o=await e.json(),a=n.default(o.access_token,{header:!0}),i=n.default(o.access_token);let c=!0;u.audience&&(c=i.aud==u.audience),i.iss==u.issuerURL&&"RS256"==a.alg&&i.exp>Math.floor(Date.now()/1e3)&&c?r.setHeader("Set-Cookie",f.serialize("kinde_token",JSON.stringify(o),{httpOnly:!0,maxAge:3600,sameSite:"strict",secure:!0,path:"/"})):console.error("One or more of the claims were not verified.")}catch(e){console.error(e)}r.redirect(u.redirectURL)}else{const e=new URL(u.issuerURL+u.issuerRoutes.logout);e.searchParams.set("redirect",u.postLogoutRedirectURL),r.redirect(e.href)}})(e,r);case"create_org":return await(async(e,r)=>{const t=e.query,{org_name:o="",start_page:s="registration"}=t,{state:n,code_challenge:a}=k(0,r,60),i=new URL(u.issuerURL+u.issuerRoutes.login);let c={redirect_uri:u.redirectURL+u.redirectRoutes.callback,client_id:u.clientID,response_type:u.responseType,scope:u.scope,code_challenge:a,code_challenge_method:u.codeChallengeMethod,state:n,start_page:s,is_create_org:!0,org_name:o,audience:u.audience};i.search=new URLSearchParams(c),r.redirect(i.href)})(e,r);case"get_token":return await(async(e,r)=>{e.cookies.kinde_token?r.status(200).json(JSON.parse(e.cookies.kinde_token)):r.status(500).json({message:"There is no kinde_token, you are not authenticated. Try logging in."})})(e,r);default:return r.status(404).end()}},exports.useKindeAuth=()=>e.useContext(l);
