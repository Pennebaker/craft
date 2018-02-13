#! /bin/bash
#! be sure to update 'clientname'

printf "   [0]   Dev -> Local\n"
printf "   [1] Stage -> Local\n"
printf "   [2]  Prod -> Local\n"
printf "   [3]   Dev -> Stage\n"
printf "   [4]   Dev -> Prod\n"
printf "   [5] Stage -> Dev\n"
printf "   [6] Stage -> Prod\n"
printf "   [7]  Prod -> Dev\n"
printf "   [8]  Prod -> Stage\n"
echo "Which rsync do you want to run?"
read Choice

if [ "${Choice}" == "0" ]; then
  rsync -avzh clientname:/srv/dev_clientname_com/web/media ../web

elif [ "${Choice}" == "1" ]; then
  rsync -avzh clientname:/srv/stage_clientname_com/web/media ../web

elif [ "${Choice}" == "2" ]; then
  rsync -avzh clientname:/srv/clientname_com/web/media ../web

elif [ "${Choice}" == "3" ]; then
  ssh clientname << EOF
rsync -avzh /srv/dev_clientname_com/web/media/ /srv/stage_clientname_com/web/media
EOF

elif [ "${Choice}" == "4" ]; then
  ssh clientname << EOF
rsync -avzh /srv/dev_clientname_com/web/media/ /srv/clientname_com/web/media
EOF

elif [ "${Choice}" == "5" ]; then
  ssh clientname << EOF
rsync -avzh /srv/stage_clientname_com/web/media/ /srv/dev_clientname_com/web/media
EOF

elif [ "${Choice}" == "6" ]; then
  ssh clientname << EOF
rsync -avzh /srv/stage_clientname_com/web/media/ /srv/clientname_com/web/media
EOF

elif [ "${Choice}" == "7" ]; then
  ssh clientname << EOF
rsync -avzh /srv/clientname_com/web/media/ /srv/dev_clientname_com/web/media
EOF

elif [ "${Choice}" == "8" ]; then
  ssh clientname << EOF
rsync -avzh /srv/clientname_com/web/media/ /srv/stage_clientname_com/web/media
EOF

else
  echo "Incorrect Selection"
fi
