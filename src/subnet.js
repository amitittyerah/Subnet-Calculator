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

	var subnet_mask_octs = subnet_mask.split( '.' ); 
	var found_weird = false;
	var i = -1;
	while ( !found_weird )
	{
		if ( parseInt(subnet_mask_octs[++i]) !== 255 )
		{
			found_weird = true;
		}
	}

	if ( i == 4 ) 
	{
		return ip_addr;
	}

	var ip_addr_blocks = ip_addr.split ( '.' );
	var weird_block = ip_addr_blocks[i];

	var weird_ip_block_binary = cal_decimal_val(weird_block);
	var weird_subnet_block_binary = cal_decimal_val(subnet_mask_octs[i]);

	var weird_mask_binary = bit_mask( weird_ip_block_binary, weird_subnet_block_binary );
	var weird_mask_val = cal_binary_val( weird_mask_binary );
	
	weird_mask_val = (type === 'network') ? weird_mask_val : cal_binary_val( bit_mask( weird_mask_binary, inverse( weird_subnet_block_binary ), true ) );

	ip_addr_blocks[i] = weird_mask_val;

	for ( var j = i+1 ; j < 4 ; j++ )
	{
		ip_addr_blocks[j] = (type === 'network') ? 0 : 255;
	}

	return ip_addr_blocks.join( '.' );

};

var inverse = function ( bin_str ) {

	bin_str = bin_str.replace(/1/g, 'x');
	bin_str = bin_str.replace(/0/g, '1');
	bin_str = bin_str.replace(/x/g, '0');
	return bin_str;

};

var fix_bin_length = function ( bin_str ) {

	for( var i = 0 ; i < 8 - bin_str.length ; i++ )
	{
		bin_str += '0';
	}

	return bin_str;
};

var bit_mask = function ( bin_str_A, bin_str_B, reverse ) {

	var result = '';
	
	bin_str_A = ""+fix_bin_length(bin_str_A);
	bin_str_B = ""+fix_bin_length(bin_str_B);

	for( var i = 0 ; i < 8 ; i++ ) 
	{
		result += ( ( reverse === true && bin_str_A.charAt(i) !== bin_str_B.charAt(i) ) || 
			( bin_str_A.charAt(i) === bin_str_B.charAt(i) && bin_str_B.charAt(i) == 1 ) ) ? '1' : '0';
	}

	return result;

};

var cal_decimal_val = function ( dec_str, val ) {

	val = typeof val === 'undefined' ? '' : val;
	
	val = dec_str%2 + '' + val;
	var div = parseInt( dec_str/2 );
	if(div > 0)
	{
		val = cal_decimal_val( div, val );
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

		mask_binary.splice( 8, 0, '.')
		mask_binary.splice( 17, 0, '.')
		mask_binary.splice( 26, 0, '.')

		var mask_string = mask_binary.join( '' );
		var mask_string_arr = mask_string.split('.');

		for( var i = 0 ; i < num_octs ; i++ )
		{
			mask_string_arr[i] = cal_binary_val(mask_string_arr[i]);
		}

		return mask_string_arr.join('.');
};