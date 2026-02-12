import { redirect } from 'next/navigation';

export default function VendorRoot() {
  // Automatically send anyone who visits '/vendor' to '/vendor/login'
  redirect('/vendor/login');
}