#! /bin/bash

# Get the directory of the currently executing script
DIR="$(dirname "${BASH_SOURCE[0]}")"

# Include files
INCLUDE_FILES=(
            "common/defaults.sh"
            "../.env.sh"
            "common/common_env.sh"
            "common/common_db.sh"
            )
for INCLUDE_FILE in "${INCLUDE_FILES[@]}"
do
    if [ -f "${DIR}/${INCLUDE_FILE}" ]
    then
        source "${DIR}/${INCLUDE_FILE}"
    else
        echo "File ${DIR}/${INCLUDE_FILE} is missing, aborting."
        exit 1
    fi
done
if [ "${GLOBAL_DB_DRIVER}" == "mysql" ] ; then
    source "${DIR}/common/common_mysql.sh"
fi
if [ "${GLOBAL_DB_DRIVER}" == "pgsql" ] ; then
    source "${DIR}/common/common_pgsql.sh"
fi

# Set the backup db file name, parent directory path, and full path
BACKUP_DB_NAME="${LOCAL_DB_NAME}-db-backup-$(date '+%Y%m%d-%H%M%S').sql"
BACKUP_DB_DIR_PATH="${LOCAL_BACKUPS_PATH}${LOCAL_DB_NAME}/${DB_BACKUP_SUBDIR}/"
BACKUP_DB_PATH="${BACKUP_DB_DIR_PATH}${BACKUP_DB_NAME}"
BACKUP_DB_PATH_LATEST="${LOCAL_BACKUPS_PATH}${LOCAL_DB_NAME}/${LOCAL_DB_NAME}-db-backup-latest.sql"

create_db ()
{
  db_exists=`mysql -u root --skip-column-names -e "show databases like '$LOCAL_DB_NAME'"`
  if [ "$db_exists" != "$LOCAL_DB_NAME" ]; then
    mysql -u root -e "create database $LOCAL_DB_NAME character set UTF8 collate utf8_bin"
  fi
}

DATABASE_IMPORTED="False"
while [[ ${DATABASE_IMPORTED} == "False" ]]; do
  FILES=($(find -E ${BACKUP_DB_DIR_PATH} -type f))
  i=0
  for ITEM in ${FILES[*]}
  do
    printf "   [%d] %s\n" $i $ITEM
    ((i++))
  done
  printf " * [%d] %s\n" $i $BACKUP_DB_PATH_LATEST

  echo "Restore which backup?"
  read Choice

  # If input was empty default to latest backup
  if [ -z ${Choice} ]; then
    Choice=${i}
  fi

  if [[ -n ${Choice//[0-9]/} ]]; then
    ((i++))
    Choice=${i}
  fi

  # if input == length of backup files list they must've picked latest
  if [ "${Choice}" -eq "${#FILES[@]}" ]; then
    SRC_DB_PATH=$BACKUP_DB_PATH_LATEST
  # else import the user choice
  else
    # Check if user selected something outside of index range
    if [ "${Choice}" -gt "${#FILES[@]}" ]; then
      echo 'Please choose a number from the list.'
    else
      SRC_DB_PATH=${FILES[$Choice]}
    fi
  fi


  if [ ${SRC_DB_PATH+X} ] ; then
    create_db
    # Figure out what type of file we're being passed in
    CAT_CMD=""
    if [ "${SRC_DB_PATH: -3}" == ".gz" ] ; then
        CAT_CMD="${DB_ZCAT_CMD}"
    fi
    if [ "${SRC_DB_PATH: -4}" == ".sql" ] ; then
        CAT_CMD="${DB_CAT_CMD}"
    fi
    if [ "${CAT_CMD}" == "" ] ; then
        echo "Unknown file type"
        exit 1
    fi

    # Temporary db dump path (remote & local)
    BACKUP_DB_PATH="/tmp/${LOCAL_DB_NAME}-db-backup-$(date '+%Y%m%d').sql"

    # Backup the local db
    if [ "${GLOBAL_DB_DRIVER}" == "mysql" ] ; then
        $LOCAL_MYSQLDUMP_CMD $LOCAL_DB_CREDS $MYSQLDUMP_SCHEMA_ARGS > "$BACKUP_DB_PATH"
        $LOCAL_MYSQLDUMP_CMD $LOCAL_DB_CREDS $LOCAL_IGNORED_DB_TABLES_STRING $MYSQLDUMP_DATA_ARGS >> "$BACKUP_DB_PATH"
    fi
    if [ "${GLOBAL_DB_DRIVER}" == "pgsql" ] ; then
        echo ${LOCAL_DB_HOST}:${LOCAL_DB_PORT}:${LOCAL_DB_NAME}:${LOCAL_DB_USER}:${LOCAL_DB_PASSWORD} > "${TMP_DB_DUMP_CREDS_PATH}"
        chmod 600 "${TMP_DB_DUMP_CREDS_PATH}"
        PGPASSFILE="${TMP_DB_DUMP_CREDS_PATH}" $LOCAL_PG_DUMP_CMD $LOCAL_DB_CREDS $LOCAL_IGNORED_DB_TABLES_STRING $PG_DUMP_ARGS --schema="${LOCAL_DB_SCHEMA}" --file="${BACKUP_DB_PATH}"
        rm "${TMP_DB_DUMP_CREDS_PATH}"
    fi
    gzip -f "$BACKUP_DB_PATH"
    echo "*** Backed up local database to ${BACKUP_DB_PATH}.gz"

    # Restore the local db from the passed in db dump
    if [ "${GLOBAL_DB_DRIVER}" == "mysql" ] ; then
        $CAT_CMD "${SRC_DB_PATH}" | $LOCAL_MYSQL_CMD $LOCAL_DB_CREDS
    fi
    if [ "${GLOBAL_DB_DRIVER}" == "pgsql" ] ; then
        echo ${LOCAL_DB_HOST}:${LOCAL_DB_PORT}:${LOCAL_DB_NAME}:${LOCAL_DB_USER}:${LOCAL_DB_PASSWORD} > "${TMP_DB_DUMP_CREDS_PATH}"
        chmod 600 "${TMP_DB_DUMP_CREDS_PATH}"
        $CAT_CMD "${SRC_DB_PATH}" | PGPASSFILE="${TMP_DB_DUMP_CREDS_PATH}" $LOCAL_PSQL_CMD $LOCAL_DB_CREDS --no-password >/dev/null
        rm "${TMP_DB_DUMP_CREDS_PATH}"
    fi
    echo "*** Restored local database from ${SRC_DB_PATH}"
    DATABASE_IMPORTED="True"
  fi
done

# Normal exit
exit 0
