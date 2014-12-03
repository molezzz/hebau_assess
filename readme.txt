centos 6.2
==========================================
#安装源
rpm -ivh http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-EPEL-6
rpm -ivh http://rpms.famillecollet.com/enterprise/remi-release-6.rpm
rpm --import /etc/pki/rpm-gpg/RPM-GPG-KEY-remi
curl -sL https://rpm.nodesource.com/setup | bash -

#安装包
yum install -y git nodejs gcc gcc-c++ openssl openssl-devel
yum --enablerepo=remi install mysql mysql-server 

#安装Tengine
useradd -s /sbin/nologin nginx
wget http://jaist.dl.sourceforge.net/project/pcre/pcre/8.33/pcre-8.33.tar.gz
tar -zxvf pcre-8.33.tar.gz
mkdir /usr/local/pcre
cd pcre-8.33
./configure --prefix=/usr/local/pcre
make
make install
cd ~
wget http://tengine.taobao.org/download/tengine-2.0.3.tar.gz
mkdir /usr/local/nginx
tar -zxvf tengine-2.0.3.tar.gz
cd tengine-2.0.3
./configure --prefix=/usr/local/nginx --with-http_stub_status_module --with-pcre=/root/pcre-8.33
make
make install
chown nginx.nginx -R /usr/local/nginx/html
vi /etc/rc.d/init.d/nginx

———————————————
#!/bin/bash 
# Tengine Startup script# processname: nginx 
# chkconfig: - 85 15 
# description: nginx is a World Wide Web server. It is used to serve 
# pidfile: /var/run/nginx.pid 
# config: /usr/local/nginx/conf/nginx.conf 
nginxd=/usr/local/nginx/sbin/nginx 
nginx_config=/usr/local/nginx/conf/nginx.conf 
nginx_pid=/usr/local/nginx/logs/nginx.pid 
RETVAL=0 
prog="nginx" 
# Source function library. 
. /etc/rc.d/init.d/functions 
# Source networking configuration. 
. /etc/sysconfig/network 
# Check that networking is up. 
[ ${NETWORKING} = "no" ] && exit 0 
[ -x $nginxd ] || exit 0 
# Start nginx daemons functions. 
start() { 
if [ -e $nginx_pid ];then 
echo "tengine already running...." 
exit 1 
fi 
echo -n $"Starting $prog: " 
daemon $nginxd -c ${nginx_config} 
RETVAL=$? 
echo 
[ $RETVAL = 0 ] && touch /var/lock/subsys/nginx 
return $RETVAL 
} 
# Stop nginx daemons functions. 
stop() { 
echo -n $"Stopping $prog: " 
killproc $nginxd 
RETVAL=$? 
echo 
[ $RETVAL = 0 ] && rm -f /var/lock/subsys/nginx /usr/local/nginx/logs/nginx.pid 
} 
reload() { 
echo -n $"Reloading $prog: " 
#kill -HUP `cat ${nginx_pid}` 
killproc $nginxd -HUP 
RETVAL=$? 
echo 
} 
# See how we were called. 
case "$1" in 
start) 
start 
;; 
stop) 
stop 
;; 
reload) 
reload 
;; 
restart) 
stop 
start 
;; 

status) 
status $prog 
RETVAL=$? 
;; 
*) 
echo $"Usage: $prog {start|stop|restart|reload|status|help}" 
exit 1 
esac 
exit $RETVAL 
————————————
chmod 775 /etc/rc.d/init.d/nginx
chkconfig nginx on

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
启动pm2-web
# pm2-web --www:port 9000 --ws:host 192.168.2.4