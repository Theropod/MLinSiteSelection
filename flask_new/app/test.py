from thrift import Thrift
from thrift.transport import TSocket, TTransport
from thrift.protocol import TBinaryProtocol
from hbase import Hbase
transport = TSocket.TSocket('62.234.212.250', 9090)
transport.setTimeout(5000)
# 设置传输方式（TFramedTransport或TBufferedTransport）
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

tableNames = client.getTableNames()
print('tableNames:', tableNames)
