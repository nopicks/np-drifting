fx_version "cerulean"

games { "gta5" }

description "NoPicks Drifting"

version "0.0.1"

server_script "@np-lib/server/sv_sql.js"
server_script "@np-lib/server/sv_rpc.js"
server_script "@np-lib/server/sv_npx.js"
server_script "@np-lib/server/sv_asyncExports.js"

client_script "@np-lib/client/cl_ui.js"
client_script "@np-lib/client/cl_rpc.js"

server_scripts {
    "server/*.js",
}

client_scripts {
    "client/*.js",
}

shared_scripts {
    "shared/*.js",
}