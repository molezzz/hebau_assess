开发环境
==========================================
+启动
nodemon --debug ./app.js
+使用国内源
npm --registry http://registry.cnpmjs.org info underscore
+使用代理
--proxy http://127.0.0.1:8087

生产环境
===========================================
$ npm install pm2@latest -g     # Install pm2 command line globally
$ pm2 start app.js -i 4  # Daemonize pm2 and Start 4 clustered instances of app.js
                         # You can also pass the 'max' params to start
                         # the right numbers of processes depending of CPUs

$ pm2 start app.js --name my-api # Name process

$ pm2 start app.js --no-daemon # Doesn't exit process

$ pm2 list               # Display all processes status
$ pm2 list -m            # Serious display
$ pm2 monit              # Monitor all processes
$ pm2 logs               # Display all processes logs in streaming
$ pm2 flush              # Empty all log file

$ pm2 stop all           # Stop all processes
$ pm2 restart all        # Restart all processes

$ pm2 reload all         # Will 0s downtime reload (for NETWORKED processes)

$ pm2 stop 0             # Stop specific process id
$ pm2 restart 0          # Restart specific process id

$ pm2 delete 0           # Will remove process from pm2 list
$ pm2 delete all         # Will remove all processes from pm2 list

$ pm2 ping               # Ensure pm2 dameon has been launched

$ pm2 startup ubuntu     # Generate init script for ubuntu to keep processes alive on restart
                         # ubuntu/centos

$ pm2 web                # Launch Health computer API endpoint (http://localhost:9615)

$ pm2 dump               # Backup current processes managed by pm2
$ pm2 resurrect          # Restore backup

$ pm2 sendSignal SIGUSR2 signal.js # Send system signal to script

启动
# pm2 start pm2_process.json