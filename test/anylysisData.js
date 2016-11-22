var body = 'var hq_str_sh601677="��̩��ҵ,17.080,17.180,17.210,17.320,17.000,17.230,17.240,2713355,46641476.000,1000,17.230,27700,17.200,800,17.190,7861,17.180,49175,17.170,2100,17.240,8636,17.250,22800,17.260,14600,17.270,15500,17.280,2016-11-22,15:00:00,00";';

var listInformation = body.split("=");
if(listInformation[1] == '"";'){
	console.log('no available data for this stock');
	return;
}else{
	var arrayListStr = listInformation[1];
	arrayListStr = arrayListStr.slice(1,arrayListStr.length-2);
	var arrayListInfo = arrayListStr.split(",");
	console.log(arrayListInfo.length);
}
