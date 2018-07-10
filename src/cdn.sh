#!/bin/sh

monitor_dir=/Users/jeason/Documents/Todos/cdnlog/
if [ ! -d $monitor_dir ]; then
    mkdir $monitor_dir
fi
cd $monitor_dir
web_stat_log=web.status
if [ ! -f $web_stat_log ]; then
   touch $web_stat_log
fi

server_list_file=server.list
if [ ! -f $server_list_file ]; then
   echo "`date '+%Y-%m-%d %H:%M:%S'` ERROR:$server_list_file NOT exists!" >>$web_stat_log
exit 1
fi

for website in `cat $server_list_file`
do
   url="$website"
   server_status=`curl -o /dev/null -s -m 10 --connect-timeout 10 -w "%{http_code}-%{time_starttransfer}" "$url"`
   server_status_list=(${server_status//-/ })
   server_status_code=${server_status_list[0]}
   server_status_time=${server_status_list[1]}
   if [ "$server_status_code" = "200" ]; then
        echo "`date '+%Y-%m-%d %H:%M:%S'` ${server_status_time}s visit $website ok!!! status code 200" >>$web_stat_log
   else
        echo "`date '+%Y-%m-%d %H:%M:%S'` ${server_status_time}s visit $website error!!! server can't connect at 10s or stop response at 10 s, send email to admin..." >>$web_stat_log
        # echo "!app alarm @136xxxxxxxx  server:$website can't connect at 10s or stop response at 10s ..." | nc smsserver port &
   fi
done
exit 0