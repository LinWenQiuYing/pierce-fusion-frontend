import { ref } from "vue";

import ArgoDBIcon from "@/assets/images/img/ARGODB.svg";
// import ExcelIcon from "@/assets/images/img/EXCLE.svg";
// import HiveIcon from "@/assets/images/img/HIVE.svg";
import InceptorIcon from "@/assets/images/img/INCEPTOR.svg";
// import {
//   default as KafkaConsumerIcon,
//   default as KafkaProducerIcon,
// } from "@/assets/images/img/KAFKA.svg";
// import KingBaseIcon from "@/assets/images/img/KINGBASE.svg";
import KunDBIcon from "@/assets/images/img/KUNDB.svg";
import MySqlIcon from "@/assets/images/img/MYSQL.svg";
// import NebulaIcon from "@/assets/images/img/NEBULA.svg";
// import Neo4JIcon from "@/assets/images/img/NEO4J.svg";
// import OracleIcon from "@/assets/images/img/ORACLE.svg";
// import PostGreSqlIcon from "@/assets/images/img/POSTGRESQL.svg";
// import RabbitMQIcon from "@/assets/images/img/RABBITMQ.svg";
// import RedisIcon from "@/assets/images/img/REDISKV.svg";
// import SqlServerIcon from "@/assets/images/img/SQLSERVER.svg";
import StellarDBIcon from "@/assets/images/img/STELLARDB.svg";
// import TextIcon from "@/assets/images/img/TEXT.svg";

export const typeOptions = ref([
  /* 
    1:MySql 2:Oracle 3:ArgoDB 4:KunDB 5:SqlServer
    6:KingBase 7:PostGreSql 8:Redis 9:RabbitMQ 10:KafkaConsumer
    11:KafkaProducer 12:Excel 13:Text 14:StellarDB 15:Neo4J
    16:Nebula 17:Hive 18:Inceptor
  */
  {
    label: "MySql",
    value: 1,
    icon: MySqlIcon,
  },
  // {
  //   label: "Oracle",
  //   value: 2,
  //   icon: OracleIcon,
  // },
  {
    label: "ArgoDB",
    value: 3,
    icon: ArgoDBIcon,
  },
  {
    label: "KunDB",
    value: 4,
    icon: KunDBIcon,
  },
  // {
  //   label: "SqlServer",
  //   value: 5,
  //   icon: SqlServerIcon,
  // },
  // {
  //   label: "KingBase",
  //   value: 6,
  //   icon: KingBaseIcon,
  // },
  // {
  //   label: "PostGreSql",
  //   value: 7,
  //   icon: PostGreSqlIcon,
  // },
  // {
  //   label: "Redis",
  //   value: 8,
  //   icon: RedisIcon,
  // },
  // {
  //   label: "RabbitMQ",
  //   value: 9,
  //   icon: RabbitMQIcon,
  // },
  // {
  //   label: "KafkaConsumer",
  //   value: 10,
  //   icon: KafkaConsumerIcon,
  // },
  // {
  //   label: "KafkaProducer",
  //   value: 11,
  //   icon: KafkaProducerIcon,
  // },
  // {
  //   label: "Excel",
  //   value: 12,
  //   icon: ExcelIcon,
  // },
  // {
  //   label: "Text",
  //   value: 13,
  //   icon: TextIcon,
  // },
  // {
  //   label: "StellarDB",
  //   value: 14,
  //   icon: StellarDBIcon,
  // },
  // {
  //   label: "Neo4J",
  //   value: 15,
  //   icon: Neo4JIcon,
  // },
  // {
  //   label: "Nebula",
  //   value: 16,
  //   icon: NebulaIcon,
  // },
  // {
  //   label: "Hive",
  //   value: 17,
  //   icon: HiveIcon,
  // },
  {
    label: "Inceptor",
    value: 18,
    icon: InceptorIcon,
  },
]);

export const graphBaseOptions = ref([
  {
    label: "StellarDB",
    value: 1,
    icon: StellarDBIcon,
  },
]);
