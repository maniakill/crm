<?php if(!defined('BASEPATH')) exit('No direct script access allowed');
$l_r = ROW_PER_PAGE;
$filter = " LIMIT 0,30 ";
if($in['offset']){
	$filter = " LIMIT ".$l_r*$in['offset'].",30 ";
}
if($in['q'] && strlen($in['q']) >= 3){
	$filter2 = " AND name LIKE '%".$in['q']."%' ";
}
if($in['all']){
	$filter='';
}
	$customers = array();
	$customer_query = $db->query("SELECT name, customer_id,c_email,comp_phone FROM customers WHERE is_admin='0' AND active='1' ".$filter2." ".$filter."");
	$customers_count = $db->field("SELECT COUNT(name) FROM customers WHERE is_admin='0' AND active='1' ");
	while ($customer_query->next()) {
		$customers['customers'][] = array(	'name' 		=> utf8_encode($customer_query->f('name')),
								  			'id'	 	=> $customer_query->f('customer_id'),
												'c_email' => utf8_encode($customer_query->f('c_email')),
												'comp_phone' => utf8_encode($customer_query->f('comp_phone')),
								 );
	}
	if(count($customers) == 0){
		$customers = 'No data to display or wrong page number';	
	}
	$nr_pag = array('pages'			=>	ceil($customers_count/$l_r),
					'current_page'	=>	$in['offset'] +1);
	$in['response'] = array();
	array_push($in['response'], $customers);	
	array_push($in['response'], $nr_pag);	
?>