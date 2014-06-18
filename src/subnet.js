var oct_mapping = [1, 2, 4, 8, 16, 32, 64, 128].reverse();
var num_octs = 4;

var recalc = function () {

	var ip_addr = $('#ip_addr').val();
	var sub_net = $('#sub_net').val();

	var subnet_mask = cal_subnet_mask( ip_addr, sub_net );

	$('#mask').val( subnet_mask );

	var net_addr = cal_address( ip_addr, subnet_mask, 'network' );
	var broadcast_addr = cal_address( ip_addr, subnet_mask, 'broadcast' );
	$('#net_addr').val( net_addr );
	$('#broadcast_addr').val( broadcast_addr );


	$('#num_addr').val(Math.pow( 2, 32 - sub_net ) - 2 );

};

var cal_address = function ( ip_addr, subnet_mask, type ) {

	// First step - convert both to binary
	var ip_addr_binary = convert_ip_to_binary_string( ip_addr ).split( '.' ).join( '' )
	var subnet_mask_binary = convert_ip_to_binary_string( subnet_mask ).split( '.' ).join( '' )
	console.log('ip ' + ip_addr_binary);
	console.log('subnet ' + subnet_mask_binary);
	// Second step - perform bitwise AND 
	var network_addr_binary = bit_mask( ip_addr_binary, subnet_mask_binary );
	console.log( 'network binary ' + network_addr_binary );
	if (type === 'network')
	{
		return convert_binary_to_ip_string( bin_to_separated( network_addr_binary.split( '' ) ).join( '' ) )
	}

	// Third step - perform bitwise OR on inverted subnet mask
	var broadcast_addr_binary = bit_mask( inverse( subnet_mask_binary ), network_addr_binary, true);
	return convert_binary_to_ip_string( bin_to_separated( broadcast_addr_binary.split( '' ) ).join( '' ) )
};

var inverse = function ( bin_str ) {

	bin_str = bin_str.replace(/1/g, 'x');
	bin_str = bin_str.replace(/0/g, '1');
	bin_str = bin_str.replace(/x/g, '0');
	return bin_str;

};

var fix_bin_length = function ( bin_str ) {

	console.log('fixing the binary length for an octect : ' + bin_str + " run for " + (8 - bin_str.length)); 
	var diff = bin_str.trim().length;
	for( var i = 0 ; i < 8 - diff ; i++ )
	{
		console.log('added ' + i);
		bin_str = '0' + bin_str ;
	}
	console.log('fixed result : ' + bin_str);

	return bin_str;
};

var bin_to_separated = function ( bin_str ) {
	bin_str.splice( 8, 0, '.')
	bin_str.splice( 17, 0, '.')
	bin_str.splice( 26, 0, '.')
	return bin_str;
};

var bit_mask = function ( bin_str_A, bin_str_B, reverse ) {

	console.log('masking between');
	console.log(bin_str_A);
	console.log(bin_str_B);
	var result = '';
	
	bin_str_A = ""+fix_bin_length(bin_str_A);
	bin_str_B = ""+fix_bin_length(bin_str_B);

	for( var i = 0 ; i < bin_str_A.length ; i++ ) 
	{
		result += ( ( reverse === true && bin_str_A.charAt(i) !== bin_str_B.charAt(i) ) || 
			( bin_str_A.charAt(i) === bin_str_B.charAt(i) && bin_str_B.charAt(i) == 1 ) ) ? '1' : '0';
	}

	return result;

};

var convert_binary_to_ip_string = function ( bin_str ) {
	var blocks = bin_str.split( '.' );
	for ( var i = 0 ; i < blocks.length ; i++ )
	{
		blocks[i] = '' + cal_binary_val( blocks[i] );
	}

	return blocks.join( '.' );
};

var convert_ip_to_binary_string = function ( ip_str ) {

	var blocks = ip_str.split( '.' );
	console.log(blocks);
	for ( var i = 0 ; i < blocks.length ; i++ )
	{
		blocks[i] = '' + fix_bin_length( cal_decimal_val( blocks[i] ) );

	}

	return blocks.join( '.' );
};

var cal_decimal_val = function ( dec_str, val ) {

	val = typeof val === 'undefined' ? '' : val;
	
	val = dec_str%2 + '' + val;
	var div = parseInt( dec_str/2 );
	if(div > 0)
	{
		val = '' + cal_decimal_val( div, val );
	}

	return val;

};

var cal_binary_val = function ( bin_str ) {

	var val = 0;
	for ( var i = 0 ; i < bin_str.length ; i++ )
	{
		if(parseInt(bin_str[i]) == 1)
		{
			val += oct_mapping[i];
		}
	}

	return val;

};



var cal_subnet_mask = function ( ip_addr, sub_net ) {

		var mask_binary = [];
		for ( var i = 0 ; i < sub_net ; i++ )
		{
			mask_binary.push(1);
		}

		var len = mask_binary.length;
		for (var i = 0 ; i < 32 - len ; i++ )
		{
			mask_binary.push(0);
		}

		mask_binary = bin_to_separated( mask_binary );

		var mask_string = mask_binary.join( '' );
		var mask_string_arr = mask_string.split('.');

		for( var i = 0 ; i < num_octs ; i++ )
		{
			mask_string_arr[i] = cal_binary_val(mask_string_arr[i]);
		}

		return mask_string_arr.join('.');
};