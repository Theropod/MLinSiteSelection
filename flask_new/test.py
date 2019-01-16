# -*- coding: utf-8 -*-
from thrift import Thrift
from thrift.transport import TSocket, TTransport
from thrift.protocol import TBinaryProtocol
from hbase import Hbase
from hbase.ttypes import *
print('\xE6\x88\x90\xE5\xBA\x9C\xE8\xB7\xAF28\xE5\x8F\xB7\xE4\xBA\x94\xE9\x81\x93\xE5\x8F\xA3\xE5\x95\x86\xE4\xB8\x9A\xE4\xB8\xAD\xE5\xBF\x83'.decode('utf-8'))
transport = TSocket.TSocket('62.234.212.250', 9090)
transport.setTimeout(5000)
trans = TTransport.TBufferedTransport(transport)
# 设置传输协议
protocol = TBinaryProtocol.TBinaryProtocol(trans)
# 确定客户端
client = Hbase.Client(protocol)
# 打开连接
transport.open()

from hbase.ttypes import ColumnDescriptor, Mutation, BatchMutation, TRegionInfo
from hbase.ttypes import IOError, AlreadyExists

tableName = "test"
rowkey = "1"

# 获取所有表名

tableNames = client.scannerGetList()
print('tableNames:', tableNames)
